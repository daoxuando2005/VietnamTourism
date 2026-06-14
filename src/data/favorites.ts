import type { Favorite } from '@/types'

export const mockFavorites: Favorite[] = [
  {
    id: 'fav-1',
    userId: 'user-1',
    destinationId: 'dest-halong',
    createdAt: '2026-06-11T12:00:00Z',
  },
  {
    id: 'fav-2',
    userId: 'user-1',
    destinationId: 'dest-sapa',
    createdAt: '2026-06-12T15:00:00Z',
  },
  {
    id: 'fav-3',
    userId: 'user-2',
    destinationId: 'dest-hoian',
    createdAt: '2026-06-13T08:00:00Z',
  },
  {
    id: 'fav-4',
    userId: 'user-3',
    destinationId: 'dest-phuquoc',
    createdAt: '2026-06-14T09:00:00Z',
  },
]
