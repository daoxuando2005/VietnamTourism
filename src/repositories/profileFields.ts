// Keep the legacy Data API projection aligned with column grants in the P0-02 migration.
export const PUBLIC_PROFILE_FIELDS = 'id,username,display_name,avatar_url,cover_url,bio,website,location,follower_count,following_count,created_at,updated_at' as const
