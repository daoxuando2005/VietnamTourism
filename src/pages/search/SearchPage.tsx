import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, PageHeader } from '@/components'
import { useDebounce } from '@/hooks'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const qParam = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(qParam)
  const [prevQParam, setPrevQParam] = useState(qParam)

  if (qParam !== prevQParam) {
    setPrevQParam(qParam)
    setQuery(qParam)
  }

  const debouncedQuery = useDebounce(query)

  return (
    <div>
      <PageHeader title="Search" description="Find destinations, reviews, and travelers." />
      <div className="mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Vietnam..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>
      {debouncedQuery ? (
        <Card>
          <p className="text-sm text-gray-600">
            Results for &ldquo;{debouncedQuery}&rdquo; will load from the search service.
          </p>
        </Card>
      ) : (
        <p className="text-sm text-gray-500">Start typing to search across the platform.</p>
      )}
    </div>
  )
}
