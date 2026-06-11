import { Link } from 'react-router-dom'
import { Card, PageHeader } from '@/components'
import { ROUTES } from '@/routes/paths'

const placeholderDestinations = [
  { slug: 'ha-long-bay', name: 'Ha Long Bay', region: 'North' },
  { slug: 'hoi-an', name: 'Hoi An', region: 'Central' },
  { slug: 'da-lat', name: 'Da Lat', region: 'Highlands' },
  { slug: 'ho-chi-minh-city', name: 'Ho Chi Minh City', region: 'South' },
]

export function DestinationsPage() {
  return (
    <div>
      <PageHeader
        title="Destinations"
        description="Discover cities, beaches, and cultural landmarks across Vietnam."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderDestinations.map(({ slug, name, region }) => (
          <Link key={slug} to={ROUTES.destinationDetail(slug)}>
            <Card className="transition-shadow hover:shadow-md">
              <div className="mb-3 aspect-video rounded-lg bg-emerald-100" />
              <h2 className="font-semibold text-gray-900">{name}</h2>
              <p className="text-sm text-gray-500">{region}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
