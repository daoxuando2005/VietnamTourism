import { Card, PageHeader } from '@/components'

export function FavoritesPage() {
  return (
    <div>
      <PageHeader
        title="Favorites"
        description="Destinations you've saved for your next trip."
      />
      <Card>
        <p className="text-sm text-gray-600">
          Sign in to save and view your favorite destinations.
        </p>
      </Card>
    </div>
  )
}
