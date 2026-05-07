'use client'

import { useState } from 'react'
import { useAuth, type PersonalInfo } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { User, CreditCard, MapPin, Phone, Calendar, Save, Building } from 'lucide-react'

interface PersonalInfoFormProps {
  onComplete?: () => void
  isModal?: boolean
}

export function PersonalInfoForm({ onComplete, isModal = false }: PersonalInfoFormProps) {
  const { user, updatePersonalInfo } = useAuth()
  
  const [formData, setFormData] = useState<PersonalInfo>({
    embg: user?.personalInfo?.embg || '',
    firstName: user?.personalInfo?.firstName || '',
    lastName: user?.personalInfo?.lastName || '',
    dateOfBirth: user?.personalInfo?.dateOfBirth || '',
    placeOfBirth: user?.personalInfo?.placeOfBirth || '',
    address: user?.personalInfo?.address || '',
    city: user?.personalInfo?.city || '',
    postalCode: user?.personalInfo?.postalCode || '',
    phoneNumber: user?.personalInfo?.phoneNumber || '',
    idCardNumber: user?.personalInfo?.idCardNumber || '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({})

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof PersonalInfo, string>> = {}
    
    if (!formData.embg) {
      newErrors.embg = 'ЕМБГ е задолжителен'
    } else if (formData.embg.length !== 13) {
      newErrors.embg = 'ЕМБГ мора да има точно 13 цифри'
    } else if (!/^\d+$/.test(formData.embg)) {
      newErrors.embg = 'ЕМБГ мора да содржи само бројки'
    }
    
    if (!formData.firstName) {
      newErrors.firstName = 'Името е задолжително'
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Презимето е задолжително'
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Датумот на раѓање е задолжителен'
    }
    
    if (!formData.placeOfBirth) {
      newErrors.placeOfBirth = 'Местото на раѓање е задолжително'
    }
    
    if (!formData.address) {
      newErrors.address = 'Адресата е задолжителна'
    }
    
    if (!formData.city) {
      newErrors.city = 'Градот е задолжителен'
    }
    
    if (!formData.postalCode) {
      newErrors.postalCode = 'Поштенскиот број е задолжителен'
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Телефонскиот број е задолжителен'
    }
    
    if (!formData.idCardNumber) {
      newErrors.idCardNumber = 'Бројот на лична карта е задолжителен'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsSubmitting(true)
    
    const result = await updatePersonalInfo(formData)
    
    setIsSubmitting(false)
    
    if (result.success) {
      toast.success('Личните податоци се успешно зачувани!')
      onComplete?.()
    } else {
      toast.error(result.error || 'Грешка при зачувување')
    }
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* EMBG & ID Card */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="embg">ЕМБГ (Единствен матичен број)</FieldLabel>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="embg"
              value={formData.embg}
              onChange={(e) => updateField('embg', e.target.value)}
              placeholder="1234567890123"
              maxLength={13}
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.embg && <FieldError>{errors.embg}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="idCardNumber">Број на лична карта</FieldLabel>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="idCardNumber"
              value={formData.idCardNumber}
              onChange={(e) => updateField('idCardNumber', e.target.value)}
              placeholder="A1234567"
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.idCardNumber && <FieldError>{errors.idCardNumber}</FieldError>}
        </Field>
      </div>

      {/* Name */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="firstName">Име</FieldLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="Петар"
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.firstName && <FieldError>{errors.firstName}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="lastName">Презиме</FieldLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Петровски"
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.lastName && <FieldError>{errors.lastName}</FieldError>}
        </Field>
      </div>

      {/* Birth Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="dateOfBirth">Датум на раѓање</FieldLabel>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.dateOfBirth && <FieldError>{errors.dateOfBirth}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="placeOfBirth">Место на раѓање</FieldLabel>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={(e) => updateField('placeOfBirth', e.target.value)}
              placeholder="Скопје"
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.placeOfBirth && <FieldError>{errors.placeOfBirth}</FieldError>}
        </Field>
      </div>

      {/* Address */}
      <Field>
        <FieldLabel htmlFor="address">Адреса на живеење</FieldLabel>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="ул. Македонија бр. 1"
            className="pl-10"
            disabled={isSubmitting}
          />
        </div>
        {errors.address && <FieldError>{errors.address}</FieldError>}
      </Field>

      {/* City & Postal */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="city">Град</FieldLabel>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Скопје"
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.city && <FieldError>{errors.city}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="postalCode">Поштенски број</FieldLabel>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            placeholder="1000"
            disabled={isSubmitting}
          />
          {errors.postalCode && <FieldError>{errors.postalCode}</FieldError>}
        </Field>
      </div>

      {/* Phone */}
      <Field>
        <FieldLabel htmlFor="phoneNumber">Телефонски број</FieldLabel>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateField('phoneNumber', e.target.value)}
            placeholder="+389 70 123 456"
            className="pl-10"
            disabled={isSubmitting}
          />
        </div>
        {errors.phoneNumber && <FieldError>{errors.phoneNumber}</FieldError>}
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Spinner className="size-4" />
            <span>Зачувување...</span>
          </>
        ) : (
          <>
            <Save className="size-4" />
            <span>Зачувај лични податоци</span>
          </>
        )}
      </Button>
    </form>
  )

  if (isModal) {
    return content
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
          <CreditCard className="size-5" />
          Лична карта
        </CardTitle>
        <CardDescription>
          Внесете ги вашите лични податоци за да можете да поднесувате барања
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
