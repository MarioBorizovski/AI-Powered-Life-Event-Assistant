'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LIFE_EVENTS } from '@/lib/mock-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
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
import { toast } from 'sonner'
import {
  FolderCog,
  PlusCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Heart,
  Users,
  Home,
  Briefcase,
  GraduationCap,
  Building,
  Car,
  Save,
  Info,
} from 'lucide-react'

interface LifeEvent {
  value: string
  label: string
  icon?: string
  description?: string
  documentsCount?: number
}

interface Document {
  id: string
  name: string
  description: string
  required: boolean
  templateFileName?: string
}

const iconOptions = [
  { value: 'heart', icon: Heart, label: 'Срце' },
  { value: 'users', icon: Users, label: 'Корисници' },
  { value: 'home', icon: Home, label: 'Дом' },
  { value: 'briefcase', icon: Briefcase, label: 'Работа' },
  { value: 'graduation', icon: GraduationCap, label: 'Образование' },
  { value: 'building', icon: Building, label: 'Зграда' },
  { value: 'car', icon: Car, label: 'Возило' },
  { value: 'file', icon: FileText, label: 'Документ' },
]

export default function AdminLifeEventsPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addingEvent, setAddingEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null)
  const [deleteEventValue, setDeleteEventValue] = useState<string | null>(null)
  const [viewingDocs, setViewingDocs] = useState<{ event: LifeEvent; docs: Document[] } | null>(null)
  const [addingDoc, setAddingDoc] = useState(false)
  
  const [newEvent, setNewEvent] = useState({
    value: '',
    label: '',
    description: '',
  })
  
  const [newDoc, setNewDoc] = useState({
    name: '',
    description: '',
    required: true,
    templateFileName: '',
  })

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    // Load life events from localStorage or use default
    const loadData = () => {
      const stored = localStorage.getItem('euslugi_life_events')
      if (stored) {
        setLifeEvents(JSON.parse(stored))
      } else {
        // Initialize with default events
        const defaultEvents = LIFE_EVENTS.map((e) => ({
          ...e,
          description: getDefaultDescription(e.value),
          documentsCount: getDefaultDocsCount(e.value),
        }))
        setLifeEvents(defaultEvents)
        localStorage.setItem('euslugi_life_events', JSON.stringify(defaultEvents))
      }
      setIsLoading(false)
    }
    
    loadData()
  }, [isAdmin, router])

  const getDefaultDescription = (value: string) => {
    const descriptions: Record<string, string> = {
      birth: 'Регистрација и документација за раѓање на дете',
      marriage: 'Документи за склучување на брак',
      divorce: 'Постапка и документи за развод',
      death: 'Пријава и документи за смртен случај',
      residence: 'Промена на адреса на живеење',
      employment: 'Документи за вработување',
      retirement: 'Постапка за пензионирање',
      education: 'Упис во образовни институции',
      property: 'Купување и продажба на имот',
      vehicle: 'Регистрација на возила',
      'study-abroad': 'Документи и постапки за студирање во странство',
    }
    return descriptions[value] || ''
  }

  const getDefaultDocsCount = (value: string) => {
    const counts: Record<string, number> = {
      birth: 4,
      marriage: 4,
      divorce: 5,
      death: 5,
      residence: 4,
      employment: 5,
      retirement: 5,
      education: 5,
      property: 5,
      vehicle: 5,
      'study-abroad': 6,
    }
    return counts[value] || 3
  }

  const handleAddEvent = () => {
    if (!newEvent.value || !newEvent.label) {
      toast.error('Пополнете ги сите задолжителни полиња')
      return
    }

    if (lifeEvents.some((e) => e.value === newEvent.value)) {
      toast.error('Животен настан со оваа вредност веќе постои')
      return
    }

    const event: LifeEvent = {
      ...newEvent,
      documentsCount: 0,
    }

    const updated = [...lifeEvents, event]
    setLifeEvents(updated)
    localStorage.setItem('euslugi_life_events', JSON.stringify(updated))

    setAddingEvent(false)
    setNewEvent({ value: '', label: '', description: '' })
    toast.success('Животниот настан е успешно додаден')
  }

  const handleEditEvent = () => {
    if (!editingEvent) return

    const updated = lifeEvents.map((e) =>
      e.value === editingEvent.value ? editingEvent : e
    )
    setLifeEvents(updated)
    localStorage.setItem('euslugi_life_events', JSON.stringify(updated))

    setEditingEvent(null)
    toast.success('Животниот настан е успешно ажуриран')
  }

  const handleDeleteEvent = () => {
    if (!deleteEventValue) return

    const updated = lifeEvents.filter((e) => e.value !== deleteEventValue)
    setLifeEvents(updated)
    localStorage.setItem('euslugi_life_events', JSON.stringify(updated))

    setDeleteEventValue(null)
    toast.success('Животниот настан е успешно избришан')
  }

  const handleViewDocs = (event: LifeEvent) => {
    // Load documents for this event from localStorage
    const stored = localStorage.getItem(`euslugi_docs_${event.value}`)
    const docs: Document[] = stored ? JSON.parse(stored) : getDefaultDocs(event.value)
    setViewingDocs({ event, docs })
  }

  const getDefaultDocs = (value: string): Document[] => {
    // Return some default documents based on life event
    const defaultDocs: Record<string, Document[]> = {
      birth: [
        { id: 'd1', name: 'Извод од матична книга на родени (родители)', description: 'Оригинал или заверена копија', required: true },
        { id: 'd2', name: 'Лични карти на родителите', description: 'Копии од двете страни', required: true },
        { id: 'd3', name: 'Извод од матична книга на венчани', description: 'Доколку родителите се во брак', required: false },
        { id: 'd4', name: 'Потврда од болница', description: 'Документ за раѓање од здравствена установа', required: true },
      ],
      marriage: [
        { id: 'd1', name: 'Извод од матична книга на родени', description: 'За двајцата партнери', required: true },
        { id: 'd2', name: 'Уверение за слободна брачна состојба', description: 'Не постаро од 6 месеци', required: true },
        { id: 'd3', name: 'Лични карти', description: 'Валидни документи за идентификација', required: true },
        { id: 'd4', name: 'Доказ за платена такса', description: 'Уплатница за административна такса', required: true },
      ],
      'study-abroad': [
        { id: 'd1', name: 'Пасош', description: 'Валиден пасош со минимум 6 месеци важност', required: true },
        { id: 'd2', name: 'Диплома/Свидетелство', description: 'Заверена копија од последната завршена диплома', required: true },
        { id: 'd3', name: 'Уверение за положени испити', description: 'Транскрипт со оценки', required: true },
        { id: 'd4', name: 'Мотивациско писмо', description: 'На англиски или јазикот на земјата', required: true },
        { id: 'd5', name: 'Препораки', description: 'Минимум две академски препораки', required: true },
        { id: 'd6', name: 'Доказ за јазична компетентност', description: 'TOEFL, IELTS или друг сертификат', required: false },
      ],
    }
    return defaultDocs[value] || [
      { id: 'd1', name: 'Лична карта', description: 'Валиден документ за идентификација', required: true },
      { id: 'd2', name: 'Барање/Апликација', description: 'Пополнет образец', required: true },
      { id: 'd3', name: 'Доказ за платена такса', description: 'Уплатница', required: true },
    ]
  }

  const handleAddDoc = () => {
    if (!viewingDocs || !newDoc.name) {
      toast.error('Внесете име на документот')
      return
    }

    const doc: Document = {
      id: `doc-${Date.now()}`,
      ...newDoc,
    }

    const updatedDocs = [...viewingDocs.docs, doc]
    setViewingDocs({ ...viewingDocs, docs: updatedDocs })
    localStorage.setItem(`euslugi_docs_${viewingDocs.event.value}`, JSON.stringify(updatedDocs))

    // Update document count
    const updatedEvents = lifeEvents.map((e) =>
      e.value === viewingDocs.event.value ? { ...e, documentsCount: updatedDocs.length } : e
    )
    setLifeEvents(updatedEvents)
    localStorage.setItem('euslugi_life_events', JSON.stringify(updatedEvents))

    setAddingDoc(false)
    setNewDoc({ name: '', description: '', required: true, templateFileName: '' })
    toast.success('Документот е успешно додаден')
  }

  const handleDeleteDoc = (docId: string) => {
    if (!viewingDocs) return

    const updatedDocs = viewingDocs.docs.filter((d) => d.id !== docId)
    setViewingDocs({ ...viewingDocs, docs: updatedDocs })
    localStorage.setItem(`euslugi_docs_${viewingDocs.event.value}`, JSON.stringify(updatedDocs))

    // Update document count
    const updatedEvents = lifeEvents.map((e) =>
      e.value === viewingDocs.event.value ? { ...e, documentsCount: updatedDocs.length } : e
    )
    setLifeEvents(updatedEvents)
    localStorage.setItem('euslugi_life_events', JSON.stringify(updatedEvents))

    toast.success('Документот е успешно избришан')
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <FolderCog className="size-8 text-primary" />
            Животни настани
          </h1>
          <p className="text-muted-foreground mt-1">
            Управувајте со категориите на животни настани и поврзаните документи
          </p>
        </div>
        <Button onClick={() => setAddingEvent(true)}>
          <PlusCircle className="size-4" />
          <span>Додај настан</span>
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Управување со животни настани</p>
              <p className="text-sm text-muted-foreground mt-1">
                Овде можете да додавате, уредувате и бришете категории на животни настани кои корисниците ги користат при креирање на барања. 
                За секој настан можете да дефинирате потребни документи.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Life Events Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <FileText className="size-5" />
            Листа на животни настани
          </CardTitle>
          <CardDescription>
            {lifeEvents.length} регистрирани категории
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Се вчитува...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Име</TableHead>
                  <TableHead>Вредност</TableHead>
                  <TableHead>Опис</TableHead>
                  <TableHead>Документи</TableHead>
                  <TableHead className="text-right">Акции</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lifeEvents.map((event) => (
                  <TableRow key={event.value}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="size-4 text-primary" />
                        </div>
                        {event.label}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {event.value}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {event.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="cursor-pointer" onClick={() => handleViewDocs(event)}>
                        {event.documentsCount || 0} документи
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
                          <DropdownMenuItem onClick={() => handleViewDocs(event)}>
                            <FileText className="size-4" />
                            <span>Управувај документи</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditingEvent(event)}>
                            <Edit className="size-4" />
                            <span>Уреди</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteEventValue(event.value)}
                          >
                            <Trash2 className="size-4" />
                            <span>Избриши</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={addingEvent} onOpenChange={setAddingEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Додај нов животен настан</DialogTitle>
            <DialogDescription>
              Креирајте нова категорија на животен настан
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Име (на македонски)</FieldLabel>
              <Input
                value={newEvent.label}
                onChange={(e) => setNewEvent({ ...newEvent, label: e.target.value })}
                placeholder="пр. Раѓање на дете"
              />
            </Field>
            <Field>
              <FieldLabel>Вредност (латиница, без празни места)</FieldLabel>
              <Input
                value={newEvent.value}
                onChange={(e) => setNewEvent({ ...newEvent, value: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                placeholder="пр. birth"
              />
            </Field>
            <Field>
              <FieldLabel>Опис</FieldLabel>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Краток опис на настанот"
                rows={3}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingEvent(false)}>Откажи</Button>
            <Button onClick={handleAddEvent}>
              <PlusCircle className="size-4" />
              <span>Додај</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Уреди животен настан</DialogTitle>
            <DialogDescription>
              Променете ги деталите за настанот
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>Име</FieldLabel>
                <Input
                  value={editingEvent.label}
                  onChange={(e) => setEditingEvent({ ...editingEvent, label: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Вредност (не може да се промени)</FieldLabel>
                <Input value={editingEvent.value} disabled />
              </Field>
              <Field>
                <FieldLabel>Опис</FieldLabel>
                <Textarea
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={3}
                />
              </Field>
            </FieldGroup>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEvent(null)}>Откажи</Button>
            <Button onClick={handleEditEvent}>
              <Save className="size-4" />
              <span>Зачувај</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <AlertDialog open={!!deleteEventValue} onOpenChange={() => setDeleteEventValue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Избриши животен настан?</AlertDialogTitle>
            <AlertDialogDescription>
              Дали сте сигурни дека сакате да го избришете овој животен настан? Постоечките барања нема да бидат засегнати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-white hover:bg-destructive/90">
              Избриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Documents Dialog */}
      <Dialog open={!!viewingDocs} onOpenChange={() => setViewingDocs(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Документи за: {viewingDocs?.event.label}</DialogTitle>
            <DialogDescription>
              Управувајте со потребните документи за овој животен настан
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 max-h-96 overflow-y-auto">
            {viewingDocs?.docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.required ? 'default' : 'secondary'}>
                    {doc.required ? 'Задолжително' : 'Опционално'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteDoc(doc.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            {addingDoc ? (
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Име на документ</FieldLabel>
                    <Input
                      value={newDoc.name}
                      onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                      placeholder="пр. Лична карта"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Опис</FieldLabel>
                    <Input
                      value={newDoc.description}
                      onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                      placeholder="Краток опис"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Име на датотека за преземање (опционално)</FieldLabel>
                    <Input
                      value={newDoc.templateFileName}
                      onChange={(e) => setNewDoc({ ...newDoc, templateFileName: e.target.value })}
                      placeholder="пр. obrazec-baranje.pdf"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Внесете име на датотека ако корисниците треба да преземат образец
                    </p>
                  </Field>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={newDoc.required}
                      onChange={(e) => setNewDoc({ ...newDoc, required: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="required" className="text-sm text-foreground">Задолжителен документ</label>
                  </div>
                </FieldGroup>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAddingDoc(false)}>
                    Откажи
                  </Button>
                  <Button size="sm" onClick={handleAddDoc}>
                    <PlusCircle className="size-4" />
                    <span>Додај</span>
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setAddingDoc(true)}>
                <PlusCircle className="size-4" />
                <span>Додај нов документ</span>
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setViewingDocs(null)}>Затвори</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
