import { Card, PageHeader } from '@/components'

export function ReviewsPage() {
  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Read honest reviews from travelers who have visited Vietnam."
      />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100" />
              <div>
                <p className="font-medium text-gray-900">Traveler Review #{i}</p>
                <p className="mt-1 text-sm text-gray-600">
                  Reviews will be loaded from the reviews service.
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
