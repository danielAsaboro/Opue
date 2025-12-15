'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  Activity,
  Bell,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Globe,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ONBOARDING_KEY = 'xandeum-onboarding-shown'

const features = [
  {
    icon: Database,
    title: 'pNode Explorer',
    description: 'Browse and analyze all storage providers with real-time metrics',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Activity,
    title: 'Network Health',
    description: 'Monitor overall network performance and health scores',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Globe,
    title: 'Geographic Map',
    description: 'View global pNode distribution with interactive heatmap',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified about offline nodes, performance drops, and more',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Anomaly detection, predictions, and historical trends',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Ask questions about the network in natural language',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
]

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', '/'], description: 'Toggle AI chat' },
]

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY)
    if (!hasSeenOnboarding) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsOpen(false)
  }

  const handleNext = () => {
    if (step < 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1.5">
              <Sparkles className="h-3 w-3" />
              Welcome
            </Badge>
          </div>
          <DialogTitle className="text-2xl">
            {step === 0 ? 'Xandeum pNode Analytics' : 'Quick Tips'}
          </DialogTitle>
          <DialogDescription>
            {step === 0
              ? 'Your comprehensive dashboard for monitoring the Xandeum storage network'
              : 'Make the most of your experience with these shortcuts'}
          </DialogDescription>
        </DialogHeader>

        {step === 0 ? (
          <div className="grid gap-3 py-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={cn('p-2 rounded-lg', feature.bgColor)}>
                  <feature.icon className={cn('h-4 w-4', feature.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{key}</kbd>
                        {i < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground mx-1">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Pro Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Click any pNode card to view detailed metrics and history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Add pNodes to your watchlist for personalized monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Use Compare mode to analyze multiple pNodes side-by-side</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ask the AI assistant: &quot;Show me network health&quot;</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  step === i ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step === 0 && (
              <Button variant="ghost" onClick={handleClose}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {step === 0 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
