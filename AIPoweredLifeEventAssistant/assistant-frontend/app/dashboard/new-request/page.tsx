'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { mockApi, LIFE_EVENTS } from '@/lib/mock-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldError, FieldSet, FieldLegend } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { FileText, Upload, ArrowRight, ArrowLeft, X, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { PersonalInfoForm } from '@/components/personal-info-form'
import Link from 'next/link'

const additionalOptions = [
  { id: 'urgent', label: 'Итен случај - приоритетна обработка' },
  { id: 'assistance', label: 'Потребна е дополнителна помош' },
  { id: 'notification', label: 'Известување преку е-пошта' },
  { id: 'consultation', label: 'Барам консултација со службеник' },
]

export default function NewRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [lifeEvent, setLifeEvent] = useState('')
  const [description, setDescription] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ lifeEvent?: string }>({})
  const [showPersonalInfoForm, setShowPersonalInfoForm] = useState(false)

  const hasPersonalInfo = user?.hasCompletedProfile && user?.personalInfo

  const validate = () => {
    const newErrors: typeof errors = {}
    
    if (!lifeEvent) {
      newErrors.lifeEvent = 'Изберете животен настан'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        return ['csv', 'xlsx', 'xls'].includes(ext || '')
      })
      
      if (validFiles.length !== selectedFiles.length) {
        toast.error('Дозволени се само CSV и Excel датотеки')
      }
      
      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions((prev) => [...prev, optionId])
    } else {
      setSelectedOptions((prev) => prev.filter((id) => id !== optionId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate() || !user) return
    
    setIsSubmitting(true)
    
    try {
      const { request } = await mockApi.createRequest(user.id, {
        lifeEvent,
        description,
        options: selectedOptions,
        documents: files.map((f) => f.name),
      })
      
      toast.success('Барањето е успешно креирано!')
      router.push(`/dashboard/requests/${request.id}`)
    } catch {
      toast.error('Грешка при креирање на барањето')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user hasn't completed personal info, show the form
  if (!hasPersonalInfo && !showPersonalInfoForm) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Генерирај барање</h1>
            <p className="text-muted-foreground mt-1">
              Пополнете го формуларот за да добиете персонализирана листа
            </p>
          </div>
        </div>

        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Потребни се лични податоци</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  За да поднесете барање, прво треба да ги пополните вашите лични податоци 
                  (лична карта). Овие информации се потребни за обработка на вашето барање.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => setShowPersonalInfoForm(true)}>
                    Пополни лични податоци
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/profile">Оди на профил</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showPersonalInfoForm && !hasPersonalInfo) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowPersonalInfoForm(false)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Лични податоци</h1>
            <p className="text-muted-foreground mt-1">
              Пополнете ги вашите лични податоци за да продолжите
            </p>
          </div>
        </div>

        <PersonalInfoForm onComplete={() => setShowPersonalInfoForm(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Генерирај барање</h1>
          <p className="text-muted-foreground mt-1">
            Пополнете го формуларот за да добиете персонализирана листа
          </p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <FileText className="size-5" />
            Ново барање
          </CardTitle>
          <CardDescription>
            Изберете го животниот настан и опишете ја вашата ситуација
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="lifeEvent">Животен настан</FieldLabel>
                <Select value={lifeEvent} onValueChange={setLifeEvent}>
                  <SelectTrigger id="lifeEvent" className={errors.lifeEvent ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Изберете животен настан" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIFE_EVENTS.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lifeEvent && <FieldError>{errors.lifeEvent}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Опис на ситуацијата (опционално)</FieldLabel>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишете ја вашата ситуација и што ви е потребно..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/500 карактери
                </p>
              </Field>
            </FieldGroup>

            <FieldSet>
              <FieldLegend>Дополнителни опции</FieldLegend>
              <div className="space-y-3 mt-3">
                {additionalOptions.map((option) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={(checked) =>
                        handleOptionChange(option.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </FieldSet>

            <Field>
              <FieldLabel>Прикачи документи (опционално)</FieldLabel>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Кликнете или повлечете датотеки овде
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Дозволени формати: CSV, Excel (.xlsx, .xls)
                    </p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="size-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Откажи
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Се генерира...</span>
                  </>
                ) : (
                  <>
                    <span>Генерирај</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
