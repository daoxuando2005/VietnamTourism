import type { Place, Province, RegionGroup } from '@/types/place'

export const provinces: Province[] = [
  // Northern Vietnam
  { id: 'hanoi', name: 'Hanoi', region: 'north', mapX: 52, mapY: 22 },
  { id: 'quang-ninh', name: 'Quang Ninh', region: 'north', mapX: 58, mapY: 14 },
  { id: 'lao-cai', name: 'Lao Cai', region: 'north', mapX: 42, mapY: 10 },
  { id: 'ninh-binh', name: 'Ninh Binh', region: 'north', mapX: 50, mapY: 28 },
  { id: 'ha-giang', name: 'Ha Giang', region: 'north', mapX: 38, mapY: 6 },

  // Central Vietnam
  { id: 'thua-thien-hue', name: 'Thua Thien Hue', region: 'central', mapX: 54, mapY: 40 },
  { id: 'da-nang', name: 'Da Nang', region: 'central', mapX: 58, mapY: 46 },
  { id: 'quang-nam', name: 'Quang Nam', region: 'central', mapX: 56, mapY: 48 },
  { id: 'khanh-hoa', name: 'Khanh Hoa', region: 'central', mapX: 60, mapY: 58 },
  { id: 'quang-binh', name: 'Quang Binh', region: 'central', mapX: 50, mapY: 36 },
  { id: 'lam-dong', name: 'Lam Dong', region: 'central', mapX: 56, mapY: 66 },

  // Southern Vietnam
  { id: 'ho-chi-minh', name: 'Ho Chi Minh City', region: 'south', mapX: 54, mapY: 82 },
  { id: 'kien-giang', name: 'Kien Giang', region: 'south', mapX: 36, mapY: 88 },
  { id: 'can-tho', name: 'Can Tho', region: 'south', mapX: 48, mapY: 78 },
  { id: 'ba-ria-vung-tau', name: 'Ba Ria - Vung Tau', region: 'south', mapX: 58, mapY: 80 },
  { id: 'an-giang', name: 'An Giang', region: 'south', mapX: 42, mapY: 84 },
]

export const places: Place[] = [
  {
    id: 'place-hanoi',
    provinceId: 'hanoi',
    name: 'Hanoi Old Quarter',
    description:
      'Wander through centuries-old streets filled with street food, colonial architecture, and vibrant local culture in Vietnam\'s capital.',
    imageUrl:
      'https://images.unsplash.com/photo-1583417319070-4a432dbff03e?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 4520,
    ticketPrice: 0,
    currency: 'VND',
  },
  {
    id: 'place-ha-long',
    provinceId: 'quang-ninh',
    name: 'Ha Long Bay Cruise',
    description:
      'Sail among thousands of limestone islands and emerald waters — a UNESCO World Heritage site and icon of Vietnam.',
    imageUrl:
      'https://images.unsplash.com/photo-1559592413-7cec4d0c213c?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 6240,
    ticketPrice: 1500000,
    currency: 'VND',
  },
  {
    id: 'place-sapa',
    provinceId: 'lao-cai',
    name: 'Sapa Rice Terraces',
    description:
      'Trek through misty mountain trails and cascading rice terraces in this highland town near the Chinese border.',
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 3890,
    ticketPrice: 350000,
    currency: 'VND',
  },
  {
    id: 'place-ninh-binh',
    provinceId: 'ninh-binh',
    name: 'Trang An Landscape',
    description:
      'Explore karst peaks and river caves by boat in a stunning landscape often called "Ha Long Bay on land."',
    imageUrl:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 2780,
    ticketPrice: 250000,
    currency: 'VND',
  },
  {
    id: 'place-ha-giang',
    provinceId: 'ha-giang',
    name: 'Ha Giang Loop',
    description:
      'Ride the legendary motorbike loop through dramatic mountain passes, ethnic minority villages, and the Dong Van Plateau.',
    imageUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 1920,
    ticketPrice: 0,
    currency: 'VND',
  },
  {
    id: 'place-hue',
    provinceId: 'thua-thien-hue',
    name: 'Imperial City of Hue',
    description:
      'Step inside the former imperial capital with its citadel, royal tombs, and refined Central Vietnamese cuisine.',
    imageUrl:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviewCount: 3140,
    ticketPrice: 200000,
    currency: 'VND',
  },
  {
    id: 'place-da-nang',
    provinceId: 'da-nang',
    name: 'Golden Bridge & Ba Na Hills',
    description:
      'Visit the famous golden-handed bridge and hilltop French village with panoramic views over the central coast.',
    imageUrl:
      'https://images.unsplash.com/photo-1583417319070-4a432dbff03e?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 5210,
    ticketPrice: 900000,
    currency: 'VND',
  },
  {
    id: 'place-hoi-an',
    provinceId: 'quang-nam',
    name: 'Hoi An Ancient Town',
    description:
      'Stroll lantern-lit streets, tailor shops, and riverside cafés in this beautifully preserved trading port.',
    imageUrl:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 5870,
    ticketPrice: 120000,
    currency: 'VND',
  },
  {
    id: 'place-nha-trang',
    provinceId: 'khanh-hoa',
    name: 'Nha Trang Beach & Islands',
    description:
      'Relax on white-sand beaches and island-hop through crystal-clear waters along Vietnam\'s premier coastal resort city.',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    reviewCount: 4120,
    ticketPrice: 450000,
    currency: 'VND',
  },
  {
    id: 'place-phong-nha',
    provinceId: 'quang-binh',
    name: 'Phong Nha Caves',
    description:
      'Discover some of the world\'s largest cave systems, including the legendary Son Doong and Paradise Cave.',
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 2340,
    ticketPrice: 550000,
    currency: 'VND',
  },
  {
    id: 'place-da-lat',
    provinceId: 'lam-dong',
    name: 'Da Lat Flower Gardens',
    description:
      'Enjoy cool mountain air, pine forests, and colorful flower farms in Vietnam\'s romantic highland retreat.',
    imageUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviewCount: 3560,
    ticketPrice: 50000,
    currency: 'VND',
  },
  {
    id: 'place-hcmc',
    provinceId: 'ho-chi-minh',
    name: 'Cu Chi Tunnels',
    description:
      'Explore the underground tunnel network used during the Vietnam War, a short trip from bustling Ho Chi Minh City.',
    imageUrl:
      'https://images.unsplash.com/photo-1583417319070-4a432dbff03e?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    reviewCount: 4890,
    ticketPrice: 250000,
    currency: 'VND',
  },
  {
    id: 'place-phu-quoc',
    provinceId: 'kien-giang',
    name: 'Phu Quoc Island',
    description:
      'Unwind on tropical beaches, snorkel coral reefs, and sample fresh seafood on Vietnam\'s largest island.',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 5430,
    ticketPrice: 0,
    currency: 'VND',
  },
  {
    id: 'place-can-tho',
    provinceId: 'can-tho',
    name: 'Cai Rang Floating Market',
    description:
      'Experience the lively Mekong Delta at dawn as boats laden with fruit and goods trade on the river.',
    imageUrl:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviewCount: 2180,
    ticketPrice: 200000,
    currency: 'VND',
  },
  {
    id: 'place-vung-tau',
    provinceId: 'ba-ria-vung-tau',
    name: 'Vung Tau Beach Escape',
    description:
      'A popular weekend beach getaway from Ho Chi Minh City with coastal views and fresh seafood restaurants.',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    rating: 4.3,
    reviewCount: 1640,
    ticketPrice: 0,
    currency: 'VND',
  },
  {
    id: 'place-an-giang',
    provinceId: 'an-giang',
    name: 'Tra Su Cajuput Forest',
    description:
      'Glide through emerald-green flooded forests by boat and observe rich birdlife in the Mekong Delta wetlands.',
    imageUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 980,
    ticketPrice: 150000,
    currency: 'VND',
  },
]

export const regionGroups: RegionGroup[] = [
  {
    id: 'north',
    label: 'Northern Vietnam',
    provinces: provinces.filter((p) => p.region === 'north'),
  },
  {
    id: 'central',
    label: 'Central Vietnam',
    provinces: provinces.filter((p) => p.region === 'central'),
  },
  {
    id: 'south',
    label: 'Southern Vietnam',
    provinces: provinces.filter((p) => p.region === 'south'),
  },
]

export function getPlaceByProvinceId(provinceId: string): Place | undefined {
  return places.find((p) => p.provinceId === provinceId)
}

export function getProvinceById(provinceId: string): Province | undefined {
  return provinces.find((p) => p.id === provinceId)
}
