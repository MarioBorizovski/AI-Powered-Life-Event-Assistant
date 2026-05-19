'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiEvents, apiTasks, type ApiRequest, type ApiTodo } from '@/lib/api-client'
import { LIFE_EVENTS } from '@/lib/mock-api'
import { PDFExport } from '@/components/pdf-export'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  PlusCircle,
  ExternalLink,
  MapPin,
  FileCheck,
  ListTodo,
  Building,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Label } from '@/components/ui/label'

const statusConfig = {
  pending: { label: 'Во тек', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  completed: { label: 'Завршено', icon: CheckCircle, className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  cancelled: { label: 'Откажано', icon: XCircle, className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [request, setRequest] = useState<ApiRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [expandedTodos, setExpandedTodos] = useState<string[]>([])

  const toggleTodoExpand = (todoId: string) => {
    setExpandedTodos((prev) =>
      prev.includes(todoId) ? prev.filter((id) => id !== todoId) : [...prev, todoId]
    )
  }

  const getPriorityConfig = (priority: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: 'Висок', className: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: AlertTriangle },
      medium: { label: 'Среден', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', icon: Clock },
      low: { label: 'Низок', className: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle },
    }
    return config[priority]
  }

  const formatDeadline = (deadline: string | null | undefined) => {
    if (!deadline) return { text: 'Нема рок', isOverdue: false }
    const date = new Date(deadline)
    const today = new Date()
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { text: `Истечен рок (${Math.abs(diffDays)} дена)`, isOverdue: true }
    if (diffDays === 0) return { text: 'Денес', isOverdue: false }
    if (diffDays === 1) return { text: 'Утре', isOverdue: false }
    return { text: `${diffDays} дена`, isOverdue: false }
  }

  useEffect(() => {
    apiEvents
      .get(id)
      .then((data) => setRequest(data))
      .catch(() => toast.error('Грешка при вчитување на барањето'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleTodoToggle = useCallback(
    async (todoId: string) => {
      try {
        const updated: ApiTodo = await apiTasks.toggle(todoId)
        setRequest((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            todos: prev.todos.map((t) => (t.id === todoId ? updated : t)),
          }
        })
      } catch {
        toast.error('Грешка при ажурирање на задачата')
      }
    },
    []
  )

  const handleMarkAsComplete = useCallback(async () => {
    if (!request || request.status !== 'pending') return
    setIsMarkingComplete(true)
    try {
      await apiEvents.updateStatus(id, 'completed')
      setRequest((prev) => (prev ? { ...prev, status: 'completed' } : prev))
      toast.success('Барањето е означено како завршено!')
    } catch {
      toast.error('Грешка при ажурирање на статусот')
    } finally {
      setIsMarkingComplete(false)
    }
  }, [id, request])

  const completedTodos = request?.todos.filter((t) => t.completed).length ?? 0
  const totalTodos = request?.todos.length ?? 0
  const progressPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  const getLifeEventLabel = (value: string) =>
    LIFE_EVENTS.find((e) => e.value === value)?.label || value

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Барањето не е пронајдено</h2>
          <p className="text-muted-foreground mb-4">
            Барањето што го барате не постои или е избришано.
          </p>
          <Button asChild>
            <Link href="/dashboard/requests">
              <ArrowLeft className="size-4" />
              <span>Назад кон барања</span>
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const status = statusConfig[request.status]

  // Build a compatible object for PDFExport (maps backend → legacy shape)
  const pdfRequest = {
    id: request.id,
    userId: request.user_id,
    lifeEvent: request.life_event,
    description: request.description,
    status: request.status,
    createdAt: request.created_at,
    uploadedFiles: [],
  }
  const pdfResult = {
    todos: request.todos.map((t) => ({ ...t, deadline: t.deadline ?? '' })),
    documents: request.documents.map((d, i) => ({ id: String(i), ...d, templateFileName: undefined })),
    services: request.services.map((s) => ({ ...s, location: s.location ?? '', link: s.link ?? '' })),
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {getLifeEventLabel(request.life_event)}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-muted-foreground">
                {new Date(request.created_at).toLocaleDateString('mk-MK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <Badge variant="secondary" className={status.className}>
                <status.icon className="size-3 mr-1" />
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <PDFExport request={pdfRequest as never} result={pdfResult as never} />
          <Button asChild>
            <Link href="/dashboard/new-request">
              <PlusCircle className="size-4" />
              <span>Ново барање</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-card-foreground">Прогрес</CardTitle>
          <CardDescription>
            Завршени {completedTodos} од {totalTodos} задачи
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-3 [&>[data-slot=progress-indicator]]:bg-green-500" />
            <p className="text-right text-sm font-medium text-green-600 dark:text-green-400">
              {progressPercentage}%
            </p>
          </div>

          {request.status === 'pending' && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Завршивте со сите задачи?</p>
                  <p className="text-xs text-muted-foreground">Означете го барањето како завршено</p>
                </div>
                <Button
                  onClick={handleMarkAsComplete}
                  disabled={isMarkingComplete}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isMarkingComplete ? (
                    <>
                      <Spinner className="size-4" />
                      <span>Се означува...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4" />
                      <span>Означи како завршено</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {request.status === 'completed' && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Барањето е завршено
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Успешно ги завршивте сите потребни чекори
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* To-Do List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <ListTodo className="size-5" />
            Листа на задачи
          </CardTitle>
          <CardDescription>
            Означете ги завршените задачи за следење на прогресот. Кликнете на задача за повеќе детали.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {request.todos.map((todo) => {
              const priorityConfig = getPriorityConfig(todo.priority)
              const deadlineInfo = formatDeadline(todo.deadline)
              const isExpanded = expandedTodos.includes(todo.id)

              return (
                <div
                  key={todo.id}
                  className={`rounded-lg border transition-colors ${
                    todo.completed
                      ? 'bg-green-500/5 border-green-500/20'
                      : deadlineInfo.isOverdue
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-background border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3 p-3">
                    <Checkbox
                      id={todo.id}
                      checked={todo.completed}
                      onCheckedChange={() => handleTodoToggle(todo.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Label
                          htmlFor={todo.id}
                          className={`text-sm cursor-pointer ${
                            todo.completed
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground font-medium'
                          }`}
                        >
                          {todo.text}
                        </Label>
                        <div className="flex items-center gap-2 shrink-0">
                          {todo.completed ? (
                            <CheckCircle className="size-4 text-green-500" />
                          ) : (
                            <Badge variant="secondary" className={priorityConfig.className}>
                              {priorityConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {todo.deadline && (
                        <div className="flex items-center justify-between mt-2">
                          <div
                            className={`flex items-center gap-1.5 text-xs ${
                              deadlineInfo.isOverdue && !todo.completed
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Calendar className="size-3" />
                            <span>
                              Рок:{' '}
                              {new Date(todo.deadline).toLocaleDateString('mk-MK', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-muted-foreground">({deadlineInfo.text})</span>
                          </div>
                          {todo.description && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => toggleTodoExpand(todo.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="size-3" />
                                  <span>Помалку</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="size-3" />
                                  <span>Детали</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && todo.description && (
                    <div className="px-3 pb-3 pt-0 ml-9">
                      <div className="p-3 rounded-md bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground">{todo.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <FileCheck className="size-5" />
            Потребни документи
          </CardTitle>
          <CardDescription>
            Листа на документи кои треба да ги обезбедите.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {request.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-background"
              >
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <Badge
                      variant="secondary"
                      className={
                        doc.required
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {doc.required ? 'Задолжително' : 'Опционално'}
                    </Badge>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <Building className="size-5" />
            Јавни сервиси
          </CardTitle>
          <CardDescription>
            Институции и сервиси каде треба да се обратите
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {request.services.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors"
              >
                <h4 className="font-medium text-foreground mb-1">{service.name}</h4>
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                )}
                {service.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="size-4" />
                    <span>{service.location}</span>
                  </div>
                )}
                {service.link && (
                  <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <span>Посети веб страна</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <PDFExport request={pdfRequest as never} result={pdfResult as never} className="flex-1" />
        <Button className="flex-1" asChild>
          <Link href="/dashboard/new-request">
            <PlusCircle className="size-4" />
            <span>Ново барање</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
