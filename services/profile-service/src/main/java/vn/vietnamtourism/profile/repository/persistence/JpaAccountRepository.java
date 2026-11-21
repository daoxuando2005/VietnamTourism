package vn.vietnamtourism.profile.repository.persistence;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.*;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import vn.vietnamtourism.profile.application.ApiException;
import vn.vietnamtourism.profile.domain.*;
import vn.vietnamtourism.profile.repository.AccountRepository;

@ApplicationScoped
public class JpaAccountRepository implements AccountRepository {
    @Inject Instance<EntityManager> manager;
    @ConfigProperty(name="PROFILE_PERSISTENCE_ENABLED",defaultValue="false") boolean enabled;
    private EntityManager em() {
        if (!enabled) throw new ApiException(503,"DEPENDENCY_UNAVAILABLE","Dịch vụ hồ sơ chưa sẵn sàng.");
        return manager.get();
    }
    @Override @Transactional
    public Optional<AccountProfile> findBySubject(UUID subject) {
        var p=em().find(PublicProfileEntity.class,subject);
        if (p==null) return Optional.empty();
        List<?> rows=em().createNativeQuery("SELECT a.app_role,v.birth_date,v.phone_number FROM profile_access a LEFT JOIN profile_private v ON v.id=a.id WHERE a.id=:id",Object[].class)
            .setParameter("id",subject).getResultList();
        if (rows.isEmpty()) throw new ApiException(503,"DEPENDENCY_UNAVAILABLE","Không thể đọc quyền hồ sơ.");
        Object[] row=(Object[])rows.getFirst();
        var birth=row[1]==null?null:row[1] instanceof java.sql.Date d?d.toLocalDate():java.time.LocalDate.parse(row[1].toString());
        return Optional.of(new AccountProfile(new PublicProfile(p.id,p.username,p.displayName,p.bio,p.avatarUrl,p.coverUrl,p.website,p.location,p.createdAt),
            p.accountStatus,(String)row[0],birth,(String)row[2]));
    }
    @Override @Transactional
    public void bootstrap(UUID subject,String username,String displayName) {
        em().createNativeQuery("INSERT INTO profile_public(id,username,display_name) VALUES (:id,:username,:displayName) ON CONFLICT DO NOTHING")
            .setParameter("id",subject).setParameter("username",username).setParameter("displayName",displayName).executeUpdate();
        if (em().find(PublicProfileEntity.class,subject)==null)
            throw new ApiException(409,"USERNAME_TAKEN","Tên người dùng đã được sử dụng.");
        em().createNativeQuery("INSERT INTO profile_private(id) VALUES (:id) ON CONFLICT DO NOTHING").setParameter("id",subject).executeUpdate();
    }
}
