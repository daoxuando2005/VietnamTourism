package vn.vietnamtourism.profile.application;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.vietnamtourism.profile.api.dto.PublicProfileResponse;
import vn.vietnamtourism.profile.repository.ProfileRepository;

@ApplicationScoped
public class ProfileApplicationService {
    private final ProfileRepository repository;

    @Inject
    public ProfileApplicationService(ProfileRepository repository) { this.repository = repository; }

    public PublicProfileResponse getPublicProfile(String username) {
        if (username == null || !username.matches("[a-z0-9_]{3,40}"))
            throw new ApiException(400, "INVALID_ARGUMENT", "Tên người dùng không hợp lệ.");
        var p = repository.findPublicByUsername(username)
            .orElseThrow(() -> new ApiException(404, "PROFILE_NOT_FOUND", "Không tìm thấy hồ sơ."));
        return new PublicProfileResponse(p.id(), p.username(), p.displayName(), p.bio(), p.avatarUrl(),
            p.coverUrl(), p.website(), p.location(), p.createdAt());
    }
}
