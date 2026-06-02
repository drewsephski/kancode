'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

type Agent = 'orchestrator' | 'claude-code' | 'codex' | 'opencode'

type TaskItem = {
  id: number | string
  task: string
  agent: Agent
  status: 'Complete' | 'In Progress' | 'Queued' | 'Waiting'
  statusVariant: 'success' | 'warning' | 'default' | 'muted'
  result: string
}

export type AgentFlowCardProps = {
  title?: string
  subtitle?: string
  className?: string
  tasks?: TaskItem[]
}

const AGENT_LABELS: Record<Agent, string> = {
  'orchestrator': 'Orchestrator',
  'claude-code': 'Claude',
  'codex': 'Codex',
  'opencode': 'OpenCode',
}

const AGENT_COLORS: Record<Agent, string> = {
  'orchestrator': 'bg-purple-500/15 text-purple-700 dark:text-purple-300 ring-purple-500/30',
  'claude-code': 'bg-orange-500/15 text-orange-700 dark:text-orange-300 ring-orange-500/30',
  'codex': 'bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-blue-500/30',
  'opencode': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
}

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 1,
    task: 'Profile: "Add search to docs site"',
    agent: 'orchestrator',
    status: 'Complete',
    statusVariant: 'success',
    result: '3 subtasks, 2 parallel',
  },
  {
    id: 2,
    task: 'Implement search logic',
    agent: 'codex',
    status: 'Complete',
    statusVariant: 'success',
    result: '95 lines, fuse.js',
  },
  {
    id: 3,
    task: 'Review implementation',
    agent: 'opencode',
    status: 'Complete',
    statusVariant: 'success',
    result: 'Approved with nit',
  },
  {
    id: 4,
    task: 'Write search UI component',
    agent: 'claude-code',
    status: 'In Progress',
    statusVariant: 'warning',
    result: '',
  },
  {
    id: 5,
    task: 'Parallel: copy review',
    agent: 'opencode',
    status: 'Queued',
    statusVariant: 'default',
    result: '',
  },
  {
    id: 6,
    task: 'Escalate: deploy decision',
    agent: 'orchestrator',
    status: 'Waiting',
    statusVariant: 'muted',
    result: '',
  },
]

const StatusBadge = ({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: 'success' | 'warning' | 'default' | 'muted'
}) => {
  const styles =
    variant === 'success'
      ? 'bg-lime-500/15 text-lime-800 dark:text-lime-300'
      : variant === 'warning'
      ? 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-300'
      : variant === 'default'
      ? 'bg-muted text-muted-foreground'
      : 'bg-muted/50 text-muted-foreground/60'

  return (
    <span className={cn('rounded-full px-2 py-1 text-xs font-medium', styles)}>
      {children}
    </span>
  )
}

/**
 * Agent flow dashboard showing the orchestrator routing work
 * across local coding agents in real time.
 */
export function AgentFlowCard({
  title = 'Agent Flow',
  subtitle = 'Live session: routing work across local agents',
  tasks = DEFAULT_TASKS,
  className,
}: AgentFlowCardProps) {
  return (
    <section
      className={cn(
        'bg-background shadow-foreground/5 inset-ring-1 inset-ring-background ring-foreground/5 relative w-full overflow-hidden rounded-2xl border border-border/60 shadow-md ring-1',
        className
      )}
      aria-label={title}
    >
      {/* Header */}
      <div className="space-y-1 border-b border-border/60 p-6">
        <div className="flex items-center gap-1.5">
          <span className="bg-lime-500/80 size-2 rounded-full" />
          <span className="bg-muted size-2 rounded-full" />
          <span className="bg-muted size-2 rounded-full" />
        </div>
        <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>

      {/* Table wrapper for responsive overflow */}
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead className="bg-muted/50 supports-[backdrop-filter]:backdrop-blur-sm sticky top-0 z-10">
            <tr className="text-muted-foreground *:text-left *:px-3 *:py-3 *:font-medium">
              <th className="w-12">#</th>
              <th className="min-w-[200px]">Task</th>
              <th className="min-w-[100px]">Agent</th>
              <th className="min-w-[110px]">Status</th>
              <th className="min-w-[160px] text-right pr-4">Result</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr
                key={task.id}
                className="hover:bg-muted/30 transition-colors *:px-3 *:py-2.5 border-b border-border/60 last:border-0"
              >
                <td className="text-muted-foreground">{idx + 1}</td>
                <td className="text-foreground font-medium whitespace-nowrap">{task.task}</td>
                <td>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                      AGENT_COLORS[task.agent]
                    )}
                  >
                    <span className={cn(
                      'size-1.5 rounded-full',
                      task.agent === 'orchestrator' ? 'bg-purple-500' :
                      task.agent === 'claude-code' ? 'bg-orange-500' :
                      task.agent === 'codex' ? 'bg-blue-500' : 'bg-emerald-500'
                    )} />
                    {AGENT_LABELS[task.agent]}
                  </span>
                </td>
                <td>
                  <StatusBadge variant={task.statusVariant}>{task.status}</StatusBadge>
                </td>
                <td className="text-right pr-4 text-muted-foreground tabular-nums text-xs">
                  {task.result || <span className="italic">running...</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 p-4 text-xs text-muted-foreground">
        <span>
          <strong>{tasks.filter(t => t.status === 'Complete').length}</strong> of <strong>{tasks.length}</strong> tasks complete
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-lime-500/80 size-1.5 rounded-full animate-pulse" />
          Session active
        </span>
      </div>
    </section>
  )
}

export default function Features() {
  return (
    <section>
      <div className="py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div>
            <h2 className="text-foreground text-4xl font-semibold">Not another bot farm</h2>
            <p className="text-muted-foreground mb-12 mt-4 text-balance text-lg">
              Bots with no coordinator are just noise.
            </p>
            <div className="bg-foreground/5 rounded-3xl p-6">
              <AgentFlowCard />
            </div>
          </div>

          <div className="border-foreground/10 relative mt-16 grid gap-12 border-b pb-12 [--radius:1rem] md:grid-cols-2">
            <div>
              <h3 className="text-foreground text-xl font-semibold">Parallel</h3>
              <p className="text-muted-foreground my-4 text-lg">
                Detects independent work and splits it across agents.
              </p>
              <Card className="aspect-video overflow-hidden px-6">
                <Card className="h-full translate-y-6" />
              </Card>
            </div>
            <div>
              <h3 className="text-foreground text-xl font-semibold">Bounded</h3>
              <p className="text-muted-foreground my-4 text-lg">
                Each agent has a job and knows its limits.
              </p>
              <Card className="aspect-video overflow-hidden">
                <Card className="translate-6 h-full" />
              </Card>
            </div>
          </div>

          <blockquote className="before:bg-primary relative mt-12 max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full">
            <p className="text-foreground text-lg">
              Tried them all. Same slop, different wrapper. <br /> This one actually
              checks itself.
            </p>
            <footer className="mt-4 flex items-center gap-2">
              <cite>Drew Sepeczi</cite>
              <span aria-hidden className="bg-foreground/15 size-1 rounded-full"></span>
              <span className="text-muted-foreground">Creator</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
