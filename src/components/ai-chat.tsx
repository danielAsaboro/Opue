'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isToolUIPart } from 'ai'
import { MessageCircle, X, Trash2, Bot, ChevronDown, Sparkles, AlertCircle, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// AI Elements
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import { renderToolOutput, hasCustomRenderer } from '@/components/ai-elements/tool-renderers'

const suggestedPrompts = [
  { label: 'Network Health', prompt: 'Show me the network health and statistics' },
  { label: 'List pNodes', prompt: 'List all pNodes on the network' },
  { label: 'Online pNodes', prompt: 'Show me only online pNodes' },
  { label: 'Top Performers', prompt: 'Find pNodes with performance score above 90' },
  { label: 'Current Epoch', prompt: "What's the current epoch and slot?" },
  { label: 'Validators', prompt: 'Show me the top validators by stake' },
]

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Create transport with useMemo to avoid recreating on every render
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), [])

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport,
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })

  // Check if API is configured on mount
  useEffect(() => {
    fetch('/api/chat')
      .then((res) => res.json())
      .then((data) => setApiConfigured(data.apiKeyConfigured ?? false))
      .catch(() => setApiConfigured(false))
  }, [])

  // Keyboard shortcut: Cmd/Ctrl + / to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSuggestionClick = (prompt: string) => {
    sendMessage({ text: prompt })
  }

  const clearMessages = () => {
    setMessages([])
  }

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = (text: string) => {
    if (text.trim()) {
      sendMessage({ text: text.trim() })
      setInputValue('')
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="px-2 py-1 rounded bg-muted text-xs text-muted-foreground flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
            <Keyboard className="w-3 h-3" />
            <span>⌘/</span>
          </div>
        )}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className={cn(
            'h-14 w-14 rounded-full shadow-lg',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'transition-transform hover:scale-105',
            isOpen && 'rotate-90'
          )}
          title="Toggle AI Chat (⌘/)"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-20 right-4 z-50',
            'w-[420px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-8rem)]',
            'bg-background border rounded-2xl shadow-2xl',
            'flex flex-col overflow-hidden',
            'animate-in fade-in slide-in-from-bottom-4 duration-300'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">pNode Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by Llama 3.3 70B</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearMessages} className="h-8 w-8" title="Clear chat">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <Conversation className="flex-1">
            <ConversationContent className="p-4">
              {/* API Key Warning */}
              {apiConfigured === false && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">Groq API Key Required</p>
                      <p className="text-muted-foreground mt-1">
                        Add <code className="bg-muted px-1 rounded">GROQ_API_KEY</code> to your <code className="bg-muted px-1 rounded">.env.local</code> file to enable AI chat.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-red-600 dark:text-red-400">Error</p>
                      <p className="text-muted-foreground mt-1">{error.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Ask about Xandeum pNodes"
                  description="I can help you explore network stats, find pNodes, check validators, and more."
                  icon={<Sparkles className="w-8 h-8" />}
                >
                  <div className="mt-4 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold mb-1">Ask about Xandeum pNodes</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        I can help you explore network stats, find pNodes, check validators, and more.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestedPrompts.slice(0, 4).map((item) => (
                        <Suggestion key={item.label} suggestion={item.prompt} onClick={handleSuggestionClick}>
                          {item.label}
                        </Suggestion>
                      ))}
                    </div>
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      {message.parts?.map((part, index) => {
                        // Handle text parts
                        if (part.type === 'text') {
                          return <MessageResponse key={index}>{part.text}</MessageResponse>
                        }

                        // Handle tool invocations (using type guard)
                        if (isToolUIPart(part)) {
                          // Extract tool name from type (e.g., 'tool-get_pnodes' -> 'get_pnodes')
                          const toolName = part.type.replace('tool-', '')
                          const hasInput = part.input !== undefined && part.input !== null
                          const hasOutput = part.state === 'output-available' || part.state === 'output-error'
                          const isError = part.state === 'output-error'

                          // Use custom renderer for completed tools with output
                          if (hasOutput && !isError && hasCustomRenderer(toolName)) {
                            const customUI = renderToolOutput(toolName, part.output)
                            if (customUI) {
                              return (
                                <div key={index} className="my-2">
                                  {customUI}
                                </div>
                              )
                            }
                          }

                          // Fallback to default tool display (loading states, errors, or tools without custom renderers)
                          return (
                            <Tool key={index} defaultOpen={part.state === 'output-available'}>
                              <ToolHeader type={part.type} state={part.state} title={toolName} />
                              <ToolContent>
                                {hasInput && <ToolInput input={part.input} />}
                                {hasOutput && (
                                  <ToolOutput output={part.output} errorText={isError ? String(part.output) : undefined} />
                                )}
                              </ToolContent>
                            </Tool>
                          )
                        }

                        return null
                      })}
                    </MessageContent>
                  </Message>
                ))
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Quick Suggestions (when there are messages) */}
          {messages.length > 0 && !isLoading && (
            <div className="border-t px-4 py-2">
              <Suggestions>
                {suggestedPrompts.slice(0, 3).map((item) => (
                  <Suggestion key={item.label} suggestion={item.prompt} onClick={handleSuggestionClick} variant="ghost" className="text-xs">
                    {item.label}
                  </Suggestion>
                ))}
              </Suggestions>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-3 bg-background">
            <PromptInput
              data-chat-form
              onSubmit={({ text }) => handleSubmit(text)}
            >
              <PromptInputTextarea
                ref={textareaRef}
                placeholder="Ask about pNodes..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="min-h-[40px]"
              />
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit status={status} disabled={!inputValue.trim() || isLoading} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      )}
    </>
  )
}
