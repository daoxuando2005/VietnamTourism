import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, LoadingSpinner, FavoriteButton } from '@/components'
import { ROUTES } from '@/routes/paths'
import { destinationService, provinceService } from '@/services'
import type { Destination, Province, DestinationCategory } from '@/types'

const CATEGORIES: (DestinationCategory | 'All')[] = [
  'All',
  'Beach',
  'Mountain',
  'Historical',
  'Cultural',
  'Nature',
  'City',
]

export function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DestinationCategory | 'All'>('All')
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('All')

  // Load provinces on mount
  useEffect(() => {
    provinceService.getAllProvinces()
      .then((data) => setProvinces(data))
      .catch((err) => console.error('Error loading provinces:', err))
  }, [])

  // Load and filter destinations based on search query, category, and province
  useEffect(() => {
    let active = true

    const fetchFilteredDestinations = async () => {
      setLoading(true)
      try {
        let results: Destination[]
        if (searchQuery.trim()) {
          results = await destinationService.searchDestinations(searchQuery)
        } else {
          results = await destinationService.getAllDestinations()
        }

        // Apply local category filter
        if (selectedCategory !== 'All') {
          results = results.filter((d) => d.category === selectedCategory)
        }

        // Apply local province filter
        if (selectedProvinceId !== 'All') {
          results = results.filter((d) => d.provinceId === selectedProvinceId)
        }

        if (active) {
          setDestinations(results)
        }
      } catch (err) {
        console.error('Error loading destinations:', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchFilteredDestinations()

    return () => {
      active = false
    }
  }, [searchQuery, selectedCategory, selectedProvinceId])

  const getProvinceName = (dest: Destination) => {
    if (dest.province) return dest.province
    const found = provinces.find((p) => p.id === dest.provinceId)
    return found ? found.name : 'Unknown Province'
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Destinations"
        description="Discover beautiful beaches, majestic mountains, and rich historical sites across Vietnam."
      />

      {/* Filter controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations by name or details..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Province dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <select
              value={selectedProvinceId}
              onChange={(e) => setSelectedProvinceId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Provinces</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={[
                    'rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                    isSelected
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ].join(' ')}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid container / Loading / Empty states */}
      {loading ? (
        <LoadingSpinner label="Searching destinations..." />
      ) : destinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No destinations found</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-xs">
            We couldn't find any destinations matching your criteria. Try adjusting your search query or filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
              setSelectedProvinceId('All')
            }}
            className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {destinations.map((dest) => (
            <Link
              key={dest.slug}
              to={ROUTES.destinationDetail(dest.slug)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800 shadow-sm border border-gray-100">
                  {dest.category}
                </span>
                <FavoriteButton destinationId={dest.id} className="absolute right-3 top-3" />
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {getProvinceName(dest)}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                  <span className="text-xs text-teal-700 font-semibold group-hover:underline">
                    Explore Details →
                  </span>
                  <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-700 border border-amber-100">
                    <svg className="h-3.5 w-3.5 fill-current text-amber-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-bold">{dest.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
