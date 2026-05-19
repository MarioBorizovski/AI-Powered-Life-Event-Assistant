'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { apiAdmin, apiEvents, type ApiRequest } from '@/lib/api-client'
import { LIFE_EVENTS } from '@/lib/mock-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Eye,
  Trash2,
  FileText,
  ClipboardList,
  CheckCheck,
  Ban,
  Search,
  Filter,
  FileOutput,
} from 'lucide-react'

const statusConfig = {
  pending: { label: 'Во тек', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  completed: { label: 'Завршено', icon: CheckCircle, className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  cancelled: { label: 'Откажано', icon: XCircle, className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
}

export default function AdminRequestsPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<ApiRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ApiRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [lifeEventFilter, setLifeEventFilter] = useState<string>('all')

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    const loadRequests = async () => {
      try {
        const data = await apiAdmin.listRequests()
        setRequests(data)
        setFilteredRequests(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRequests()
  }, [isAdmin, router])

  useEffect(() => {
    let result = [...requests]

    if (searchQuery) {
      result = result.filter(
        (r) =>
          r.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }

    if (lifeEventFilter !== 'all') {
      result = result.filter((r) => r.life_event === lifeEventFilter)
    }

    setFilteredRequests(result)
  }, [searchQuery, statusFilter, lifeEventFilter, requests])

  const getLifeEventLabel = (value: string) => {
    return LIFE_EVENTS.find((e) => e.value === value)?.label || value
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await apiEvents.delete(deleteId)
      setRequests((prev) => prev.filter((r) => r.id !== deleteId))
      setDeleteId(null)
      toast.success('Барањето е успешно избришано')
    } catch (error) {
      toast.error('Грешка при бришење на барањето')
    }
  }

  const handleStatusChange = async (requestId: string, status: ApiRequest['status']) => {
    try {
      await apiEvents.updateStatus(requestId, status)
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      )
      toast.success(`Статусот е променет на "${statusConfig[status].label}"`)
    } catch (error) {
      toast.error('Грешка при промена на статусот')
    }
  }

  const handleExportAll = () => {
    const exportData = filteredRequests.map((r) => ({
      id: r.id,
      userId: r.user_id,
      lifeEvent: getLifeEventLabel(r.life_event),
      description: r.description,
      status: statusConfig[r.status].label,
      createdAt: r.created_at,
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `baranja-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Успешно експортирани ${filteredRequests.length} барања`)
  }

  if (!isAdmin) {
    return null
  }

  const stats = {
    total: requests.length,
    completed: requests.filter((r) => r.status === 'completed').length,
    pending: requests.filter((r) => r.status === 'pending').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Управување со барања</h1>
          <p className="text-muted-foreground mt-1">
            Преглед, уредување и бришење на сите барања на платформата
          </p>
        </div>
        <Button variant="outline" onClick={handleExportAll} disabled={filteredRequests.length === 0}>
          <FileOutput className="size-4" />
          <span>Експорт ({filteredRequests.length})</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Вкупно</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="size-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Завршени</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="size-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Во тек</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="size-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Откажани</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Пребарај по ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Сите статуси</SelectItem>
                <SelectItem value="pending">Во тек</SelectItem>
                <SelectItem value="completed">Завршени</SelectItem>
                <SelectItem value="cancelled">Откажани</SelectItem>
              </SelectContent>
            </Select>
            <Select value={lifeEventFilter} onValueChange={setLifeEventFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Животен настан" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Сите настани</SelectItem>
                {LIFE_EVENTS.map((event) => (
                  <SelectItem key={event.value} value={event.value}>
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <ClipboardList className="size-5" />
            Листа на барања
            {filteredRequests.length !== requests.length && (
              <Badge variant="secondary">{filteredRequests.length} од {requests.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Кликнете на барање за да ги видите деталите и управувате со задачите
          </CardDescription>
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
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-medium text-foreground">Нема барања</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || lifeEventFilter !== 'all' 
                  ? "Нема барања кои одговараат на филтерот."
                  : "Сеуште нема креирани барања на платформата."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Животен настан</TableHead>
                    <TableHead>Корисник ID</TableHead>
                    <TableHead>Датум</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Акции</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const status = statusConfig[request.status]
                    return (
                      <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/admin/requests/${request.id}`} className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="size-4 text-primary" />
                            </div>
                            {getLifeEventLabel(request.life_event)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {request.user_id.slice(0, 12)}...
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('mk-MK', {
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/requests/${request.id}`}>
                                  <Eye className="size-4" />
                                  <span>Преглед и уреди</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(request.id, 'completed')}
                                disabled={request.status === 'completed'}
                              >
                                <CheckCheck className="size-4 text-green-500" />
                                <span>Означи завршено</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(request.id, 'pending')}
                                disabled={request.status === 'pending'}
                              >
                                <Clock className="size-4 text-yellow-500" />
                                <span>Означи во тек</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(request.id, 'cancelled')}
                                disabled={request.status === 'cancelled'}
                              >
                                <Ban className="size-4 text-red-500" />
                                <span>Откажи</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(request.id)}
                              >
                                <Trash2 className="size-4" />
                                <span>Избриши</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Дали сте сигурни?</AlertDialogTitle>
            <AlertDialogDescription>
              Оваа акција не може да се поништи. Барањето и сите поврзани податоци ќе бидат трајно избришани.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Избриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
