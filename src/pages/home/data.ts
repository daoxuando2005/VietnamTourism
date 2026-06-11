export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1559592413-7cec4d0c213c?auto=format&fit=crop&w=1920&q=80'

export const featuredDestinations = [
  {
    slug: 'ha-long-bay',
    name: 'Ha Long Bay',
    region: 'Quang Ninh',
    rating: 4.9,
    reviewCount: 3240,
    image:
      'https://images.unsplash.com/photo-1559592413-7cec4d0c213c?auto=format&fit=crop&w=800&q=80',
    tag: 'UNESCO Site',
  },
  {
    slug: 'hoi-an',
    name: 'Hoi An',
    region: 'Quang Nam',
    rating: 4.8,
    reviewCount: 2810,
    image:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
    tag: 'Ancient Town',
  },
  {
    slug: 'da-nang',
    name: 'Da Nang',
    region: 'Central Vietnam',
    rating: 4.7,
    reviewCount: 1950,
    image:
      'https://images.unsplash.com/photo-1583417319070-4a432dbff03e?auto=format&fit=crop&w=800&q=80',
    tag: 'Coastal City',
  },
  {
    slug: 'phu-quoc',
    name: 'Phu Quoc',
    region: 'Kien Giang',
    rating: 4.8,
    reviewCount: 2100,
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    tag: 'Island Paradise',
  },
  {
    slug: 'ninh-binh',
    name: 'Ninh Binh',
    region: 'Northern Vietnam',
    rating: 4.9,
    reviewCount: 1680,
    image:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    tag: 'Nature Escape',
  },
  {
    slug: 'sapa',
    name: 'Sapa',
    region: 'Lao Cai',
    rating: 4.8,
    reviewCount: 2450,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    tag: 'Mountain Trek',
  },
] as const

export const trendingReviews = [
  {
    id: '1',
    author: 'Sarah Mitchell',
    avatar: 'SM',
    destination: 'Ha Long Bay',
    rating: 5,
    date: '2 days ago',
    title: 'Absolutely breathtaking cruise experience',
    excerpt:
      'The limestone karsts at sunrise were unreal. Our overnight cruise was well-organized and the food was excellent.',
  },
  {
    id: '2',
    author: 'James Chen',
    avatar: 'JC',
    destination: 'Hoi An',
    rating: 5,
    date: '4 days ago',
    title: 'Magical lantern-lit evenings',
    excerpt:
      'Walking through the old town at night felt like stepping back in time. Great street food and tailor shops everywhere.',
  },
  {
    id: '3',
    author: 'Emma Rodriguez',
    avatar: 'ER',
    destination: 'Sapa',
    rating: 4,
    date: '1 week ago',
    title: 'Stunning rice terraces and hiking',
    excerpt:
      'The trek through Muong Hoa Valley was challenging but worth every step. Local homestay hospitality was wonderful.',
  },
] as const

export const platformStats = [
  { label: 'Destinations', value: '120+', icon: '📍' },
  { label: 'Reviews', value: '15,000+', icon: '⭐' },
  { label: 'Travelers', value: '50,000+', icon: '✈️' },
] as const
