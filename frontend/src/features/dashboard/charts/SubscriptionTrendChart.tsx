import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TimeSeriesPoint } from '@/types/api'

export function SubscriptionTrendChart({ data, currency }: { data: TimeSeriesPoint[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="subFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-500)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--color-accent-500)" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="var(--border-subtle)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={48} />
        <Tooltip
          cursor={{ fill: 'var(--glass-border)' }}
          contentStyle={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            fontSize: 13,
          }}
          formatter={(value) => [`${currency} ${Number(value).toLocaleString()}`, 'Monthly cost']}
        />
        <Bar dataKey="amount" fill="url(#subFill)" radius={[8, 8, 0, 0]} animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  )
}
