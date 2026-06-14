import type { Review } from '@/types'

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    destinationId: 'dest-halong',
    userId: 'user-1',
    rating: 5,
    title: 'Unbelievable cruise!',
    content: 'An incredible overnight cruise around the limestone islands. Breathtaking views at sunset!',
    createdAt: '2026-06-10T14:00:00Z',
  },
  {
    id: 'rev-2',
    destinationId: 'dest-hoian',
    userId: 'user-2',
    rating: 5,
    title: 'Lantern magic',
    content: 'Walking through the ancient town at night with lanterns lit everywhere was absolutely magical.',
    createdAt: '2026-06-12T09:30:00Z',
  },
  {
    id: 'rev-3',
    destinationId: 'dest-halong',
    userId: 'user-2',
    rating: 4,
    title: 'Stunning but crowded',
    content: 'Loved the scenery, but there were many tourist boats. Still a must-see in Vietnam!',
    createdAt: '2026-06-13T16:45:00Z',
  },
  {
    id: 'rev-4',
    destinationId: 'dest-sapa',
    userId: 'user-1',
    rating: 5,
    title: 'Beautiful terraces',
    content: 'Trekking through the Sapa rice terraces was a highlight of my trip. The homestay hospitality was wonderful.',
    createdAt: '2026-06-14T11:20:00Z',
  },
  {
    id: 'rev-5',
    destinationId: 'dest-phuquoc',
    userId: 'user-3',
    rating: 4,
    title: 'Relaxing beaches',
    content: 'Great resort experience, pristine white sand beaches, and excellent seafood at the night market.',
    createdAt: '2026-06-14T15:10:00Z',
  },
]
