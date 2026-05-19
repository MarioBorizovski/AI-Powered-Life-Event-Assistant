'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { apiEvents, apiTasks, type ApiRequest } from '@/lib/api-client'
import { LIFE_EVENTS } from '@/lib/mock-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Trash2,
  Edit,
  Save,
  User,
  Download,
  FileOutput,
} from 'lucide-react'

const statusConfig = {
  pending: { label: 'Во тек', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  completed: { label: 'Завршено', icon: CheckCircle, className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  cancelled: { label: 'Откажано', icon: XCircle, className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
}

export default function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isAdmin } = useAuth()
  const router = useRouter()

  const [request, setRequest] = useState<ApiRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTodos, setExpandedTodos] = useState<string[]>([])
  const [addingTodo, setAddingTodo] = useState(false)
  const [deleteTodoId, setDeleteTodoId] = useState<string | null>(null)
  const [newTodo, setNewTodo] = useState({
    text: '',
    description: '',
    deadline: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  })

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    const loadData = async () => {
      try {
        const data = await apiEvents.get(id)
        setRequest(data)
      } catch (error) {
        setRequest(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, isAdmin, router])

  const toggleTodoExpand = (todoId: string) => {
    setExpandedTodos((prev) =>
      prev.includes(todoId)
        ? prev.filter((id) => id !== todoId)
        : [...prev, todoId]
    )
  }

  const getPriorityConfig = (priority: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: 'Висок', className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
      medium: { label: 'Среден', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
      low: { label: 'Низок', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    }
    return config[priority]
  }

  const formatDeadline = (deadline: string | null | undefined) => {
    if (!deadline) return { text: 'Нема рок', isOverdue: false }
    const date = new Date(deadline)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: `Истечен рок (${Math.abs(diffDays)} дена)`, isOverdue: true }
    if (diffDays === 0) return { text: 'Денес', isOverdue: false }
    if (diffDays === 1) return { text: 'Утре', isOverdue: false }
    return { text: `${diffDays} дена`, isOverdue: false }
  }

  const handleTodoToggle = useCallback(async (todoId: string, completed: boolean) => {
    if (!request) return
    try {
      await apiTasks.toggle(todoId)
      setRequest((prev) =>
        prev
          ? {
              ...prev,
              todos: prev.todos.map((t) =>
                t.id === todoId ? { ...t, completed } : t
              ),
            }
          : prev
      )
    } catch (error) {
      toast.error('Грешка при ажурирање на задачата')
    }
  }, [request])

  const handleStatusChange = async (status: ApiRequest['status']) => {
    if (!request) return
    try {
      await apiEvents.updateStatus(id, status)
      setRequest((prev) => (prev ? { ...prev, status } : prev))
      toast.success(`Статусот е променет на "${statusConfig[status].label}"`)
    } catch (error) {
      toast.error('Грешка при промена на статусот')
    }
  }

  const handleAddTodo = async () => {
    toast.info('Додавање задачи преку администраторскиот панел ќе биде достапно наскоро.')
    setAddingTodo(false)
    setNewTodo({ text: '', description: '', deadline: '', priority: 'medium' })
  }

  const handleEditTodo = async () => {
    toast.info('Уредување задачи преку администраторскиот панел ќе биде достапно наскоро.')
  }

  const handleDeleteTodo = async () => {
    toast.info('Бришење задачи преку администраторскиот панел ќе биде достапно наскоро.')
    setDeleteTodoId(null)
  }

  const getLifeEventLabel = (value: string) => {
    return LIFE_EVENTS.find((e) => e.value === value)?.label || value
  }

  const handleExportRequest = () => {
    if (!request) return
    
    const exportData = {
      request: {
        id: request.id,
        userId: request.user_id,
        lifeEvent: getLifeEventLabel(request.life_event),
        description: request.description,
        status: statusConfig[request.status].label,
        createdAt: request.created_at,
      },
      todos: request.todos.map(t => ({
        text: t.text,
        description: t.description,
        deadline: t.deadline,
        priority: t.priority,
        completed: t.completed,
      })),
      documents: request.documents.map(d => ({
        name: d.name,
        description: d.description,
        required: d.required,
      })),
      services: request.services.map(s => ({
        name: s.name,
        description: s.description,
        location: s.location,
      })),
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `baranje-${request.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Барањето е успешно експортирано')
  }

  if (!isAdmin) return null

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card className="bg-card border-border">
          <CardContent className="pt-6 text-center">
            <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Барањето не е пронајдено</h2>
            <p className="text-muted-foreground mb-4">
              Барањето што го барате не постои или е избришано.
            </p>
            <Button onClick={() => router.push('/dashboard/admin/requests')}>
              <ArrowLeft className="size-4" />
              <span>Назад кон барања</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = statusConfig[request.status]
  const completedTodos = request.todos.filter((t) => t.completed).length
  const totalTodos = request.todos.length
  const progressPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/admin/requests')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {getLifeEventLabel(request.life_event)}
          </h1>
          <p className="text-muted-foreground mt-1">
            Управување со барање и задачи
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportRequest}>
            <FileOutput className="size-4" />
            <span>Експорт</span>
          </Button>
          <Badge variant="secondary" className={`${status.className} text-sm px-3 py-1`}>
            <status.icon className="size-4 mr-1.5" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Request Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <FileText className="size-5" />
            Информации за барањето
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">ID на барање</p>
              <p className="font-mono text-sm text-foreground">{request.id}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Корисник ID</p>
              <p className="font-mono text-sm text-foreground flex items-center gap-2">
                <User className="size-3" />
                {request.user_id}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Креирано</p>
              <p className="text-sm text-foreground flex items-center gap-2">
                <Calendar className="size-3" />
                {new Date(request.created_at).toLocaleDateString('mk-MK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Промени статус</p>
              <Select value={request.status} onValueChange={(val) => handleStatusChange(val as ApiRequest['status'])}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Во тек</SelectItem>
                  <SelectItem value="completed">Завршено</SelectItem>
                  <SelectItem value="cancelled">Откажано</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {request.description && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Опис</p>
              <p className="text-sm text-foreground">{request.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Прогрес</CardTitle>
          <CardDescription>
            {completedTodos} од {totalTodos} задачи завршени
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-3 [&>[data-slot=progress-indicator]]:bg-green-500" />
            <p className="text-right text-sm font-medium text-green-600 dark:text-green-400">
              {progressPercentage}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* To-Do List with Admin Controls */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <ListTodo className="size-5" />
              Листа на задачи
            </CardTitle>
            <CardDescription>
              Управувајте со задачите за ова барање
            </CardDescription>
          </div>
          <Button onClick={() => setAddingTodo(true)}>
            <PlusCircle className="size-4" />
            <span>Додај задача</span>
          </Button>
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
                      onCheckedChange={(checked) =>
                        handleTodoToggle(todo.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Label
                          htmlFor={todo.id}
                          className={`text-sm cursor-pointer ${
                            todo.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'
                          }`}
                        >
                          {todo.text}
                        </Label>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className={priorityConfig.className}>
                            {priorityConfig.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {todo.deadline && (
                        <div className={`flex items-center gap-1.5 text-xs ${
                          deadlineInfo.isOverdue && !todo.completed
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-muted-foreground'
                        }`}>
                          <Calendar className="size-3" />
                          <span>Рок: {new Date(todo.deadline).toLocaleDateString('mk-MK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-muted-foreground">({deadlineInfo.text})</span>
                        </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toast.info('Уредување задачи ќе биде достапно наскоро.')}
                          >
                            <Edit className="size-3" />
                            <span>Уреди</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => setDeleteTodoId(todo.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleTodoExpand(todo.id)}
                          >
                            {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
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
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {request.documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                </div>
                <Badge variant={doc.required ? 'default' : 'secondary'} className="shrink-0">
                  {doc.required ? 'Задолжително' : 'Опционално'}
                </Badge>
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
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {request.services.map((service) => (
              <div
                key={service.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Building className="size-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="size-3" />
                    {service.location}
                  </p>
                </div>
                {service.link && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={service.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Todo Dialog */}
      <Dialog open={addingTodo} onOpenChange={setAddingTodo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Додај нова задача</DialogTitle>
            <DialogDescription>
              Додадете нова задача за корисникот
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Наслов</FieldLabel>
              <Input
                value={newTodo.text}
                onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
                placeholder="Наслов на задачата"
              />
            </Field>
            <Field>
              <FieldLabel>Опис</FieldLabel>
              <Textarea
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                placeholder="Детален опис на задачата"
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel>Рок</FieldLabel>
              <Input
                type="date"
                value={newTodo.deadline}
                onChange={(e) => setNewTodo({ ...newTodo, deadline: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Приоритет</FieldLabel>
              <Select value={newTodo.priority} onValueChange={(val) => setNewTodo({ ...newTodo, priority: val as 'high' | 'medium' | 'low' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Висок</SelectItem>
                  <SelectItem value="medium">Среден</SelectItem>
                  <SelectItem value="low">Низок</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingTodo(false)}>Откажи</Button>
            <Button onClick={handleAddTodo}>
              <PlusCircle className="size-4" />
              <span>Додај</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Todo Dialog */}
      <AlertDialog open={!!deleteTodoId} onOpenChange={() => setDeleteTodoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Избриши задача?</AlertDialogTitle>
            <AlertDialogDescription>
              Дали сте сигурни дека сакате да ја избришете оваа задача? Оваа акција не може да се поништи.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTodo} className="bg-destructive text-white hover:bg-destructive/90">
              Избриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
