package vn.vietnamtourism.profile.api.dto;

import java.time.*;
import java.util.UUID;

public record OwnProfileResponse(UUID id,String username,String displayName,String bio,String avatarUrl,
    String coverUrl,String website,String location,Instant createdAt,LocalDate birthDate,String phoneNumber,String role) {}
