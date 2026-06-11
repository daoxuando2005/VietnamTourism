import { Card, PageHeader } from '@/components'

export function FeedPage() {
  return (
    <div>
      <PageHeader
        title="Social Feed"
        description="Photos, tips, and stories from the Vietnam travel community."
      />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100" />
              <div>
                <p className="font-medium text-gray-900">Traveler #{i}</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Community posts will appear here once the feed service is connected.
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
