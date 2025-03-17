// components/ChatInterface.tsx
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'

interface Message {
  content: string
  isUser: boolean
  timestamp: Date
}

export function ChatInterface({
  grade,
  subject,
  subjects
}: {
  grade: 'primary' | 'secondary' | undefined
  subject: string | undefined
  subjects: string[]
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || !grade || !subject) return

    // Add user message
    setMessages(prev => [...prev, {
      content: input,
      isUser: true,
      timestamp: new Date()
    }])

    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/ask', {
        question: userInput,
        grade_level: grade,
        subject
      })

      setMessages(prev => [...prev, {
        content: response.data.response,
        isUser: false,
        timestamp: new Date()
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        content: 'Error getting response. Please try again.',
        isUser: false,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg p-4">
      <ScrollArea className="flex-1 mb-4 pr-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px] mt-2" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your curriculum question..."
          disabled={!grade || !subject}
        />
        <Button
          type="submit"
          disabled={!input.trim() || !grade || !subject || isLoading}
        >
          {isLoading ? 'Sending...' : 'Ask'}
        </Button>
      </form>
    </div>
  )
}