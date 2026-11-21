package vn.vietnamtourism.profile.api.dto;

import java.time.Instant;
import java.util.UUID;

public record PublicProfileResponse(UUID id, String username, String displayName, String bio,
        String avatarUrl, String coverUrl, String website, String location, Instant createdAt) {}
