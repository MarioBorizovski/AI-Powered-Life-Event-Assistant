'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { PersonalInfoForm } from '@/components/personal-info-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { User, Mail, Lock, Save, Shield, CreditCard, MapPin, Phone, Calendar, Edit, Building } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile, isAdmin } = useAuth()
  
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showEditPersonalInfo, setShowEditPersonalInfo] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const validateProfile = () => {
    const newErrors: typeof errors = {}
    
    if (!name) {
      newErrors.name = 'Името е задолжително'
    } else if (name.length < 2) {
      newErrors.name = 'Името мора да има најмалку 2 карактери'
    }
    
    if (!email) {
      newErrors.email = 'Е-пошта е задолжителна'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Невалидна е-пошта'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors: typeof errors = {}
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Внесете ја тековната лозинка'
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'Внесете нова лозинка'
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Лозинката мора да има најмалку 6 карактери'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Потврдете ја новата лозинка'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Лозинките не се совпаѓаат'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateProfile()) return
    
    setIsUpdating(true)
    
    const result = await updateProfile({ name, email })
    
    setIsUpdating(false)
    
    if (result.success) {
      toast.success('Профилот е успешно ажуриран!')
    } else {
      toast.error(result.error || 'Грешка при ажурирање')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePassword()) return
    
    setIsChangingPassword(true)
    
    // In a real app, you would verify the current password
    const result = await updateProfile({ password: newPassword })
    
    setIsChangingPassword(false)
    
    if (result.success) {
      toast.success('Лозинката е успешно променета!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      toast.error(result.error || 'Грешка при промена на лозинка')
    }
  }

  const personalInfo = user?.personalInfo

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Профил</h1>
        <p className="text-muted-foreground mt-1">
          Управувајте со вашите лични податоци
        </p>
      </div>

      {/* User Info Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="size-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-card-foreground">{user?.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {user?.email}
                {isAdmin && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Shield className="size-3 mr-1" />
                    Администратор
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ID Card Display - Only for regular users */}
      {!isAdmin && personalInfo && !showEditPersonalInfo ? (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                Лична карта
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEditPersonalInfo(true)}>
                <Edit className="size-4" />
                <span>Уреди</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* EMBG & ID Card Number */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background/60 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">ЕМБГ</p>
                  <p className="font-mono font-medium text-foreground">{personalInfo.embg}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Број на лична карта</p>
                  <p className="font-mono font-medium text-foreground">{personalInfo.idCardNumber}</p>
                </div>
              </div>

              {/* Name */}
              <div className="p-3 rounded-lg bg-background/60 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Име и презиме</p>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  {personalInfo.firstName} {personalInfo.lastName}
                </p>
              </div>

              {/* Birth Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background/60 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Датум на раѓање</p>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    {new Date(personalInfo.dateOfBirth).toLocaleDateString('mk-MK', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Место на раѓање</p>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    {personalInfo.placeOfBirth}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="p-3 rounded-lg bg-background/60 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Адреса</p>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  {personalInfo.address}, {personalInfo.postalCode} {personalInfo.city}
                </p>
              </div>

              {/* Phone */}
              <div className="p-3 rounded-lg bg-background/60 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Телефон</p>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  {personalInfo.phoneNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !isAdmin ? (
        <div>
          {showEditPersonalInfo && (
            <div className="mb-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowEditPersonalInfo(false)}>
                Откажи уредување
              </Button>
            </div>
          )}
          <PersonalInfoForm onComplete={() => setShowEditPersonalInfo(false)} />
        </div>
      ) : null}

      {/* Update Profile Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Податоци за најава</CardTitle>
          <CardDescription>
            Ажурирајте ја вашата е-пошта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Е-пошта</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isUpdating}
                  />
                </div>
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner className="size-4" />
                  <span>Зачувување...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Зачувај промени</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Промена на лозинка</CardTitle>
          <CardDescription>
            Ажурирајте ја вашата лозинка за зголемена безбедност
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">Тековна лозинка</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="********"
                    className="pl-10"
                    disabled={isChangingPassword}
                  />
                </div>
                {errors.currentPassword && <FieldError>{errors.currentPassword}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="newPassword">Нова лозинка</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="********"
                    className="pl-10"
                    disabled={isChangingPassword}
                  />
                </div>
                {errors.newPassword && <FieldError>{errors.newPassword}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Потврди нова лозинка</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="pl-10"
                    disabled={isChangingPassword}
                  />
                </div>
                {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
              </Field>
            </FieldGroup>

            <Button type="submit" variant="outline" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Spinner className="size-4" />
                  <span>Менување...</span>
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  <span>Промени лозинка</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="size-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Безбедност на сметка</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Препорачуваме да користите силна лозинка со комбинација на букви, бројки 
                и специјални знаци. Не споделувајте ги вашите податоци за најава со никого.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
