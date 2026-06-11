import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components'

export function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <div>
      <PageHeader
        title={slug?.replace(/-/g, ' ') ?? 'Destination'}
        description="Detailed guide, photos, and traveler reviews."
      />
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Destination details for <span className="font-medium">{slug}</span> will load from the
          API.
        </p>
      </div>
    </div>
  )
}
