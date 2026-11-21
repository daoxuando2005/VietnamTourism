package vn.vietnamtourism.profile.repository;

import java.util.Optional;
import vn.vietnamtourism.profile.domain.PublicProfile;

public interface ProfileRepository {
    Optional<PublicProfile> findPublicByUsername(String username);
}
