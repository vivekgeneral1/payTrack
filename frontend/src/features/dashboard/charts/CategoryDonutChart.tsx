import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategoryBreakdown } from '@/types/api'

const FALLBACK_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#ef4444', '#6366f1']

export function CategoryDonutChart({ data }: { data: CategoryBreakdown[] }) {
  if (data.length === 0) {
    return <p className="flex h-64 items-center justify-center text-sm text-[var(--text-muted)]">No spending recorded yet this period.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="categoryName" innerRadius={62} outerRadius={92} paddingAngle={3} animationDuration={900}>
          {data.map((entry, index) => (
            <Cell key={entry.categoryId} fill={entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            fontSize: 13,
          }}
          formatter={(value, name) => [Number(value).toLocaleString(), name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
