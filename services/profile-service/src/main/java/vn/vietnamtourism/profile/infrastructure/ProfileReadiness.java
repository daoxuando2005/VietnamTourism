package vn.vietnamtourism.profile.infrastructure;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.enterprise.inject.Instance;
import jakarta.persistence.EntityManager;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.health.*;

@Readiness @ApplicationScoped
public class ProfileReadiness implements HealthCheck {
    @Inject Instance<EntityManager> entityManager;
    @ConfigProperty(name="PROFILE_PERSISTENCE_ENABLED", defaultValue="false") boolean enabled;
    @Override public HealthCheckResponse call() {
        if (!enabled) return HealthCheckResponse.named("profile-store").down().withData("reason", "P0-05 database not configured").build();
        try {
            entityManager.get().createNativeQuery("SELECT 1").getSingleResult();
            return HealthCheckResponse.up("profile-store");
        } catch (RuntimeException e) { return HealthCheckResponse.down("profile-store"); }
    }
}
