import type { BootstrapRequest, OwnProfile, PublicProfile } from '@/api/generated/types.gen'
import { apiClient } from './api/client'

export const profileApi = {
  own: (signal?: AbortSignal) => apiClient.get<OwnProfile>('/me/profile', { auth: 'required', signal }),
  bootstrap: (data: BootstrapRequest) => apiClient.post<OwnProfile>('/me/profile', data, { auth: 'required' }),
  byUsername: (name: string) => apiClient.get<PublicProfile>(`/profiles/${encodeURIComponent(name)}`, { auth: 'none' }),
  byId: (id: string) => apiClient.get<PublicProfile>(`/profiles/id/${encodeURIComponent(id)}`, { auth: 'none' }),
}
