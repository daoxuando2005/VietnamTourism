package vn.vietnamtourism.profile.repository;

import java.util.Optional;
import java.util.UUID;
import vn.vietnamtourism.profile.domain.PublicProfile;

public interface ProfileRepository {
    Optional<PublicProfile> findPublicByUsername(String username);
    Optional<PublicProfile> findPublicById(UUID id);
}
