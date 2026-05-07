'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { mockApi, type Request, LIFE_EVENTS } from '@/lib/mock-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PlusCircle,
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  FileText,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
} from 'lucide-react'

const statusConfig = {
  pending: { label: 'Во тек', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  completed: { label: 'Завршено', icon: CheckCircle, className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  cancelled: { label: 'Откажано', icon: XCircle, className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
}

// User Dashboard Component
function UserDashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRequests = async () => {
      if (user) {
        const data = await mockApi.getRequests(user.id)
        setRequests(data)
      }
      setIsLoading(false)
    }
    loadRequests()
  }, [user])

  const stats = {
    total: requests.length,
    completed: requests.filter((r) => r.status === 'completed').length,
    pending: requests.filter((r) => r.status === 'pending').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
  }

  const recentRequests = requests.slice(-3).reverse()

  const getLifeEventLabel = (value: string) => {
    return LIFE_EVENTS.find((e) => e.value === value)?.label || value
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-0">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Добредојдовте, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Управувајте со вашите барања и пристапете до јавните услуги
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new-request">
            <PlusCircle className="size-4" />
            <span>Ново барање</span>
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ClipboardList className="size-4" />
              Вкупно барања
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              Завршени
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="size-4 text-yellow-500" />
              Во тек
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Успешност
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-primary">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-card-foreground">Последни барања</CardTitle>
            <CardDescription>Преглед на вашите неодамнешни барања</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/requests">
              <span>Види сите</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-medium text-foreground">Нема барања</p>
              <p className="text-sm text-muted-foreground mb-4">
                Сеуште немате креирано барања. Започнете со креирање на ново барање.
              </p>
              <Button asChild>
                <Link href="/dashboard/new-request">
                  <PlusCircle className="size-4" />
                  <span>Креирај барање</span>
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => {
                const status = statusConfig[request.status]
                return (
                  <Link
                    key={request.id}
                    href={`/dashboard/requests/${request.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {getLifeEventLabel(request.lifeEvent)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString('mk-MK', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary" className={status.className}>
                      <status.icon className="size-3 mr-1" />
                      {status.label}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Генерирај ново барање</CardTitle>
            <CardDescription>
              Изберете животен настан и добијте персонализирана листа на потребни документи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/new-request">
                <PlusCircle className="size-4" />
                <span>Започни</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Потребна помош?</CardTitle>
            <CardDescription>
              Нашиот AI асистент е тука да ви помогне со прашања
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/dashboard/chatbot">
                <span>Отвори Chatbot</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Admin Dashboard Component with Analytics
function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalUsers: number
    totalRequests: number
    pendingRequests: number
    completedRequests: number
    cancelledRequests: number
    requestsByLifeEvent: { lifeEvent: string; count: number }[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentRequests, setRecentRequests] = useState<Request[]>([])

  useEffect(() => {
    const loadData = async () => {
      const [statsData, requestsData] = await Promise.all([
        mockApi.getSystemStats(),
        mockApi.getRequests(),
      ])
      setStats(statsData)
      setRecentRequests(requestsData.slice(-5).reverse())
      setIsLoading(false)
    }
    loadData()
  }, [])

  const getLifeEventLabel = (value: string) => {
    return LIFE_EVENTS.find((e) => e.value === value)?.label || value
  }

  const completionRate = stats && stats.totalRequests > 0
    ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
    : 0

  const pendingRate = stats && stats.totalRequests > 0
    ? Math.round((stats.pendingRequests / stats.totalRequests) * 100)
    : 0

  const cancelledRate = stats && stats.totalRequests > 0
    ? Math.round((stats.cancelledRequests / stats.totalRequests) * 100)
    : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="size-8 text-primary" />
          Аналитика
        </h1>
        <p className="text-muted-foreground mt-1">
          Преглед на статистики и перформанси на платформата
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Вкупно корисници</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ClipboardList className="size-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Вкупно барања</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground">{stats?.totalRequests || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="size-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Завршени</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats?.completedRequests || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="size-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Во тек</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats?.pendingRequests || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <PieChart className="size-5" />
              Дистрибуција по статус
            </CardTitle>
            <CardDescription>Преглед на барањата по статус</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-500" />
                      <span className="text-foreground">Завршени</span>
                    </div>
                    <span className="font-medium text-foreground">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-3 [&>[data-slot=progress-indicator]]:bg-green-500" />
                  <p className="text-xs text-muted-foreground">{stats?.completedRequests || 0} барања</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-yellow-500" />
                      <span className="text-foreground">Во тек</span>
                    </div>
                    <span className="font-medium text-foreground">{pendingRate}%</span>
                  </div>
                  <Progress value={pendingRate} className="h-3 [&>[data-slot=progress-indicator]]:bg-yellow-500" />
                  <p className="text-xs text-muted-foreground">{stats?.pendingRequests || 0} барања</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <XCircle className="size-4 text-red-500" />
                      <span className="text-foreground">Откажани</span>
                    </div>
                    <span className="font-medium text-foreground">{cancelledRate}%</span>
                  </div>
                  <Progress value={cancelledRate} className="h-3 [&>[data-slot=progress-indicator]]:bg-red-500" />
                  <p className="text-xs text-muted-foreground">{stats?.cancelledRequests || 0} барања</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <BarChart3 className="size-5" />
              Барања по животен настан
            </CardTitle>
            <CardDescription>Дистрибуција на барањата по тип</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : stats?.requestsByLifeEvent && stats.requestsByLifeEvent.length > 0 ? (
              <div className="space-y-3">
                {stats.requestsByLifeEvent.slice(0, 6).map((item) => {
                  const percentage = stats.totalRequests > 0
                    ? Math.round((item.count / stats.totalRequests) * 100)
                    : 0
                  return (
                    <div key={item.lifeEvent} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground truncate">{item.lifeEvent}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Нема податоци за прикажување</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-card-foreground">Последни барања</CardTitle>
            <CardDescription>Најновите барања на платформата</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/requests">
              <span>Види сите</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-medium text-foreground">Нема барања</p>
              <p className="text-sm text-muted-foreground">
                Сеуште нема креирани барања на платформата.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID на корисник</TableHead>
                  <TableHead>Животен настан</TableHead>
                  <TableHead>Датум</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Акција</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => {
                  const status = statusConfig[request.status]
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-xs">
                        {request.userId.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {getLifeEventLabel(request.lifeEvent)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString('mk-MK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.className}>
                          <status.icon className="size-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/admin/requests/${request.id}`}>
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="pt-6">
            <Link href="/dashboard/admin/requests" className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Управувај барања</p>
                <p className="text-sm text-muted-foreground">Преглед и уредување</p>
              </div>
              <ArrowRight className="size-4 ml-auto text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/40 transition-colors">
          <CardContent className="pt-6">
            <Link href="/dashboard/admin/users" className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Корисници</p>
                <p className="text-sm text-muted-foreground">Управување</p>
              </div>
              <ArrowRight className="size-4 ml-auto text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/40 transition-colors">
          <CardContent className="pt-6">
            <Link href="/dashboard/admin/life-events" className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <FileText className="size-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Животни настани</p>
                <p className="text-sm text-muted-foreground">Конфигурација</p>
              </div>
              <ArrowRight className="size-4 ml-auto text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main Dashboard Page
export default function DashboardPage() {
  const { isAdmin } = useAuth()

  if (isAdmin) {
    return <AdminDashboard />
  }

  return <UserDashboard />
}
