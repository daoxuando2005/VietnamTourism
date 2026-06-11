import { Card, PageHeader } from '@/components'

const stats = [
  { label: 'Destinations', value: '—' },
  { label: 'Reviews', value: '—' },
  { label: 'Users', value: '—' },
  { label: 'Posts', value: '—' },
]

export function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Manage destinations, reviews, and platform content."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
