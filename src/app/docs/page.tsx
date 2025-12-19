'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Rocket,
  Sparkles,
  Code,
  FileCode,
  Blocks,
  ExternalLink,
  Github,
  Users,
  Cpu,
  ArrowRight,
} from 'lucide-react'

const userDocs = [
  {
    title: 'Getting Started',
    description: 'Quick start guide to set up and use the platform',
    icon: Rocket,
    href: '/docs/getting-started',
    badge: 'Start Here',
  },
  {
    title: 'Feature Guide',
    description: 'Complete walkthrough of all platform features',
    icon: Sparkles,
    href: '/docs/features',
  },
]

const devDocs = [
  {
    title: 'pRPC Integration',
    description: 'How we connect to Xandeum pNodes via pRPC',
    icon: Code,
    href: '/docs/prpc',
    badge: 'Technical',
  },
  {
    title: 'API Reference',
    description: 'All API endpoints with request/response examples',
    icon: FileCode,
    href: '/docs/api',
  },
  {
    title: 'Architecture',
    description: 'System design, services, and data flow',
    icon: Blocks,
    href: '/docs/architecture',
  },
]

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-1 flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to understand and use the Xandeum pNode Analytics Platform
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="https://opue.vercel.app" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Live Demo
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://github.com/danielAsaboro/Opue" target="_blank">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Link>
          </Button>
        </div>
      </div>

      {/* For Users Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">For Users</h2>
        </div>
        <p className="text-muted-foreground">
          Learn how to use the platform to monitor and analyze Xandeum pNodes
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {userDocs.map((doc) => (
            <Link key={doc.href} href={doc.href}>
              <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <doc.icon className="h-6 w-6 text-primary" />
                    </div>
                    {doc.badge && (
                      <Badge variant="secondary">{doc.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-2 mt-4">
                    {doc.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* For Developers/Judges Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Cpu className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">For Developers & Judges</h2>
        </div>
        <p className="text-muted-foreground">
          Technical documentation covering pRPC integration, APIs, and system architecture
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devDocs.map((doc) => (
            <Link key={doc.href} href={doc.href}>
              <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <doc.icon className="h-6 w-6 text-primary" />
                    </div>
                    {doc.badge && (
                      <Badge variant="outline">{doc.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-2 mt-4">
                    {doc.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Built for Xandeum Bounty</h3>
              <p className="text-sm text-muted-foreground">
                This platform demonstrates real pRPC integration with Xandeum pNodes
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/docs/prpc">
                  <Code className="h-4 w-4 mr-2" />
                  View pRPC Docs
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
