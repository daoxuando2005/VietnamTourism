import { useParams } from 'react-router-dom'
import { Card, PageHeader } from '@/components'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()

  return (
    <div>
      <PageHeader
        title={username ?? 'Your Profile'}
        description="Traveler profile, reviews, and saved destinations."
      />
      <Card>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100" />
          <div>
            <p className="font-semibold text-gray-900">{username ?? 'Guest'}</p>
            <p className="text-sm text-gray-500">Member since 2026</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
