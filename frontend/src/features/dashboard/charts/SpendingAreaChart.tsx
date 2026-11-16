import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TimeSeriesPoint } from '@/types/api'

export function SpendingAreaChart({ data, currency }: { data: TimeSeriesPoint[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="var(--border-subtle)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={48} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            fontSize: 13,
          }}
          formatter={(value) => [`${currency} ${Number(value).toLocaleString()}`, 'Spent']}
        />
        <Area type="monotone" dataKey="amount" stroke="var(--color-brand-500)" strokeWidth={2.5} fill="url(#spendingFill)" animationDuration={900} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
