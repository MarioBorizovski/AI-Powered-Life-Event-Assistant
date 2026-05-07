'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  Home,
  User,
  ClipboardList,
  MessageCircle,
  LogOut,
  PlusCircle,
  Users,
  ChevronRight,
  Settings,
  BarChart3,
  FolderCog,
} from 'lucide-react'

// Navigation for regular users
const userNavItems = [
  { href: '/dashboard', label: 'Почетна', icon: Home },
  { href: '/dashboard/profile', label: 'Профил', icon: User },
  { href: '/dashboard/requests', label: 'Барања', icon: ClipboardList },
  { href: '/dashboard/chatbot', label: 'Chatbot', icon: MessageCircle },
]

// Navigation for admin users
const adminNavItems = [
  { href: '/dashboard', label: 'Аналитика', icon: BarChart3 },
  { href: '/dashboard/profile', label: 'Профил', icon: User },
  { href: '/dashboard/admin/requests', label: 'Барања', icon: ClipboardList },
  { href: '/dashboard/admin/users', label: 'Корисници', icon: Users },
  { href: '/dashboard/admin/life-events', label: 'Животни настани', icon: FolderCog },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="h-16 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <FileText className="size-6" />
            <span>еУслуги</span>
            {isAdmin && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Админ
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            {!isAdmin && (
              <Button variant="default" size="sm" asChild>
                <Link href="/dashboard/new-request">
                  <PlusCircle className="size-4" />
                  <span className="hidden sm:inline">Генерирај барање</span>
                </Link>
              </Button>
            )}
            
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline max-w-32 truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    {isAdmin && (
                      <span className="text-xs text-primary font-medium mt-1">Администратор</span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <Settings className="size-4" />
                    <span>Поставки</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="size-4" />
                  <span>Одјави се</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* Right Sidebar Navigation */}
        <aside className="hidden lg:flex w-64 border-l border-border bg-card flex-col p-4">
          <nav className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              {isAdmin ? 'Администрација' : 'Навигација'}
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="size-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="size-5" />
              <span>Одјави се</span>
            </Button>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="size-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
