'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}



const quickActions = [
  { label: 'Потребни документи', message: 'Кои документи ми се потребни?' },
  { label: 'Раѓање на дете', message: 'Како да пријавам раѓање на дете?' },
  { label: 'Склучување брак', message: 'Што ми е потребно за брак?' },
  { label: 'Контакт информации', message: 'Како да контактирам?' },
]

export default function ChatbotPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Здраво ${user?.name?.split(' ')[0] || 'корисниче'}! Јас сум вашиот AI асистент за јавни услуги. Како можам да ви помогнам денес?\n\nМожете да ме прашате за потребни документи, процедури или информации за различни животни настани.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) throw new Error('API error')
      
      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Се извинуваме, настана грешка при комуникацијата со серверот. Ве молиме обидете се повторно.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] pb-20 lg:pb-0">
      <Card className="bg-card border-border h-full flex flex-col">
        <CardHeader className="border-b border-border shrink-0">
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="size-4 text-primary" />
            </div>
            AI Асистент
          </CardTitle>
          <CardDescription>
            Поставете прашања за јавни услуги и добијте инстант одговори
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="size-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('mk-MK', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="size-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="size-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      <span className="text-sm text-muted-foreground">Пишува...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Sparkles className="size-4 text-muted-foreground shrink-0" />
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => handleSend(action.message)}
                  disabled={isTyping}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишете порака..."
                disabled={isTyping}
                className="flex-1"
              />
              <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
                {isTyping ? (
                  <Spinner className="size-4" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
