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
import { toast } from 'sonner'
import {
  PlusCircle,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Eye,
  Trash2,
  FileText,
} from 'lucide-react'

const statusConfig = {
  pending: { label: 'Во тек', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  completed: { label: 'Завршено', icon: CheckCircle, className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  cancelled: { label: 'Откажано', icon: XCircle, className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
}

export default function RequestsPage() {
  const { user, isAdmin } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const loadRequests = async () => {
      if (user) {
        const data = await mockApi.getRequests(user.id)
        setRequests(data.reverse())
      }
      setIsLoading(false)
    }
    loadRequests()
  }, [user])

  const getLifeEventLabel = (value: string) => {
    return LIFE_EVENTS.find((e) => e.value === value)?.label || value
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    await mockApi.deleteRequest(deleteId)
    setRequests((prev) => prev.filter((r) => r.id !== deleteId))
    setDeleteId(null)
    toast.success('Барањето е успешно избришано')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Барања</h1>
          <p className="text-muted-foreground mt-1">
            Преглед и управување со вашите барања
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new-request">
            <PlusCircle className="size-4" />
            <span>Ново барање</span>
          </Link>
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Сите барања</CardTitle>
          <CardDescription>
            Листа на сите ваши поднесени барања
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
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
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
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {requests.map((request) => {
                  const status = statusConfig[request.status]
                  return (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background"
                    >
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {getLifeEventLabel(request.lifeEvent)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString('mk-MK')}
                        </p>
                        <Badge variant="secondary" className={`${status.className} mt-2`}>
                          <status.icon className="size-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/requests/${request.id}`}>
                              <Eye className="size-4" />
                              <span>Преглед</span>
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(request.id)}
                            >
                              <Trash2 className="size-4" />
                              <span>Избриши</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Животен настан</TableHead>
                      <TableHead>Датум</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Акции</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => {
                      const status = statusConfig[request.status]
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="size-4 text-primary" />
                              </div>
                              {getLifeEventLabel(request.lifeEvent)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString('mk-MK', {
                              day: 'numeric',
                              month: 'long',
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
                                  <Link href={`/dashboard/requests/${request.id}`}>
                                    <Eye className="size-4" />
                                    <span>Преглед</span>
                                  </Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setDeleteId(request.id)}
                                  >
                                    <Trash2 className="size-4" />
                                    <span>Избриши</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Дали сте сигурни?</AlertDialogTitle>
            <AlertDialogDescription>
              Оваа акција не може да се поништи. Барањето ќе биде трајно избришано.
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
