import {
  FeaturedDestinations,
  HeroSection,
  StatsSection,
  TrendingReviews,
} from '@/components/home'

export function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedDestinations />
      <TrendingReviews />
      <StatsSection />
    </div>
  )
}
