'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Notification = {
    text: string
    read: boolean
}

export function NotificationInbox() {
    const [notifications, setNotifications] = React.useState<Notification[]>([
        { text: 'Имате ново барање', read: false },
        { text: 'Вашиот документ е одобрен', read: false },
        { text: 'Новa порака од администрација', read: false },
    ])

    const unreadCount = notifications.filter(n => !n.read).length

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        )
    }

    return (
        // The fix: Trigger markAllAsRead whenever the dropdown menu opens
        <DropdownMenu onOpenChange={(open) => { if (open) markAllAsRead() }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-5" />

                    {/* badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1 min-w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
                {notifications.length === 0 ? (
                    <DropdownMenuItem disabled>
                        Нема известувања
                    </DropdownMenuItem>
                ) : (
                    notifications.map((n, i) => (
                        <DropdownMenuItem key={i} className={!n.read ? "font-semibold" : ""}>
                            {n.text}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
