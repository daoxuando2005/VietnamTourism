import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { HERO_IMAGE } from '@/pages/home/data'

export function HeroSection() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `${ROUTES.search}?q=${encodeURIComponent(trimmed)}` : ROUTES.search)
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <img
        src={HERO_IMAGE}
        alt="Ha Long Bay, Vietnam"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-24 text-center sm:px-6 sm:pt-28">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 sm:text-base">
          Vietnam Tourism Platform
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Discover Vietnam
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg md:text-xl">
          Explore the most beautiful destinations across Vietnam
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:mt-10 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-3 px-3">
            <svg
              className="h-5 w-5 shrink-0 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, cities, or experiences..."
              className="w-full py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-base"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 active:bg-amber-700 sm:shrink-0"
          >
            Search
          </button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-white/80">
          <span>Popular:</span>
          {['Ha Long Bay', 'Hoi An', 'Phu Quoc'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1 backdrop-blur transition-colors hover:bg-white/20"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
