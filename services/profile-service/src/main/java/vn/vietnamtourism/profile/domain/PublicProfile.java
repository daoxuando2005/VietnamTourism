package vn.vietnamtourism.profile.domain;

import java.time.Instant;
import java.util.UUID;

public record PublicProfile(UUID id, String username, String displayName, String bio,
        String avatarUrl, String coverUrl, String website, String location, Instant createdAt) {}
