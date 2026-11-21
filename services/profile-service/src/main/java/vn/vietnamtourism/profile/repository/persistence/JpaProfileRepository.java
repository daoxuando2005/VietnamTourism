package vn.vietnamtourism.profile.repository.persistence;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.enterprise.inject.Instance;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.Optional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import vn.vietnamtourism.profile.application.ApiException;
import vn.vietnamtourism.profile.domain.PublicProfile;
import vn.vietnamtourism.profile.repository.ProfileRepository;

@ApplicationScoped
public class JpaProfileRepository implements ProfileRepository {
    @Inject Instance<EntityManager> entityManager;
    @ConfigProperty(name = "PROFILE_PERSISTENCE_ENABLED", defaultValue = "false") boolean enabled;

    @Override
    @Transactional
    public Optional<PublicProfile> findPublicByUsername(String username) {
        if (!enabled) throw new ApiException(503, "DEPENDENCY_UNAVAILABLE", "Dịch vụ hồ sơ chưa sẵn sàng.");
        return entityManager.get().createQuery(
            "from PublicProfileEntity p where p.username = :username and p.accountStatus = 'ACTIVE'", PublicProfileEntity.class)
            .setParameter("username", username).setMaxResults(1)
            .setHint("jakarta.persistence.query.timeout", 5000)
            .getResultStream().findFirst()
            .map(p -> new PublicProfile(p.id, p.username, p.displayName, p.bio, p.avatarUrl,
                p.coverUrl, p.website, p.location, p.createdAt));
    }
}
