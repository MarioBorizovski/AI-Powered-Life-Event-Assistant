'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Mail, Lock, User, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  
  const { register } = useAuth()
  const router = useRouter()

  const validate = () => {
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
    
    if (!password) {
      newErrors.password = 'Лозинка е задолжителна'
    } else if (password.length < 6) {
      newErrors.password = 'Лозинката мора да има најмалку 6 карактери'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Потврдете ја лозинката'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Лозинките не се совпаѓаат'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsLoading(true)
    
    const result = await register(name, email, password)
    
    setIsLoading(false)
    
    if (result.success) {
      toast.success('Успешно се регистриравте!')
      router.push('/dashboard')
    } else {
      toast.error(result.error || 'Грешка при регистрација')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Регистрација</CardTitle>
          <CardDescription>
            Креирајте нова сметка за да користите еУслуги
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Име и презиме</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Петар Петровски"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>
              
              <Field>
                <FieldLabel htmlFor="email">Е-пошта</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>
              
              <Field>
                <FieldLabel htmlFor="password">Лозинка</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>
              
              <Field>
                <FieldLabel htmlFor="confirmPassword">Потврди лозинка</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
              </Field>
            </FieldGroup>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="size-4" />
                  <span>Регистрирање...</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  <span>Регистрирај се</span>
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <span>Веќе имате сметка? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Најавете се
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
