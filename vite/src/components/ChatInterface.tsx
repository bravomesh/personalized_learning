import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import axios, { CancelTokenSource } from 'axios'

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
  const [recording, setRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null)

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }

      recognition.onend = () => {
        setRecording(false)
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setRecording(false)
      }

      recognitionRef.current = recognition
    } else {
      console.warn("Speech Recognition API not supported in this browser.")
    }
  }, [])

  const handleRecord = () => {
    if (recognitionRef.current) {
      if (!recording) {
        setRecording(true)
        recognitionRef.current.start()
      } else {
        recognitionRef.current.stop()
        setRecording(false)
      }
    }
  }

  // Cancel the ongoing request
  const handleCancelRequest = () => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Request cancelled by user.')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || !grade || !subject) return

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        content: input,
        isUser: true,
        timestamp: new Date()
      }
    ])

    const userInput = input
    setInput('')
    setIsLoading(true)

    // Create a cancel token for this request
    cancelTokenSourceRef.current = axios.CancelToken.source()

    try {
      const response = await axios.post('http://localhost:8000/ask', {
        question: userInput,
        grade_level: grade,
        subject
      }, { cancelToken: cancelTokenSourceRef.current.token })

      setMessages(prev => [
        ...prev,
        {
          content: response.data.response,
          isUser: false,
          timestamp: new Date()
        }
      ])
    } catch (error: any) {
      if (axios.isCancel(error)) {
        setMessages(prev => [
          ...prev,
          {
            content: 'Request cancelled by user.',
            isUser: false,
            timestamp: new Date()
          }
        ])
      } else {
        setMessages(prev => [
          ...prev,
          {
            content: `Error getting response. Outside curriculum or ${subject} scope!!`,
            isUser: false,
            timestamp: new Date()
          }
        ])
      }
    } finally {
      setIsLoading(false)
      cancelTokenSourceRef.current = null
    }
  }

  return (
    <div className="flex flex-col max-h-max border rounded-lg p-4">
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

      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your curriculum question..."
          disabled={!grade || !subject}
        />
        <Button
          type="button"
          onClick={handleRecord}
          className="px-3"
          disabled={!grade || !subject || isLoading}
        >
          {recording ? 'Stop' : 'Record'}
        </Button>
        <Button
          type="submit"
          disabled={!input.trim() || !grade || !subject || isLoading}
        >
          {isLoading ? 'Sending...' : 'Ask'}
        </Button>
        {isLoading && (
          <Button
            type="button"
            onClick={handleCancelRequest}
            className="px-3 bg-red-600 text-white"
          >
            Stop Request
          </Button>
        )}
      </form>
    </div>
  )
}
