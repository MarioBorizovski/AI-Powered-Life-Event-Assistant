'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { apiEvents, type ApiRequest } from '@/lib/api-client'
import { LIFE_EVENTS } from '@/lib/mock-api'
import { Button } from '@/components/ui/button'
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
import { FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { Label } from '@/components/ui/label'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ lifeEvent?: string }>({})

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!lifeEvent) {
      newErrors.lifeEvent = 'Изберете животен настан'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      const req: ApiRequest = await apiEvents.create({
        life_event: lifeEvent,
        description: description || undefined,
        options: selectedOptions.length > 0 ? selectedOptions : undefined,
      })

      toast.success('Барањето е успешно креирано!')
      router.push(`/dashboard/requests/${req.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Грешка при креирање на барањето'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
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
                  <SelectTrigger
                    id="lifeEvent"
                    className={errors.lifeEvent ? 'border-destructive' : ''}
                  >
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
                  maxLength={500}
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
