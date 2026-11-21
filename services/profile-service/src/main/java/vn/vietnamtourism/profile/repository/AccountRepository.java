package vn.vietnamtourism.profile.repository;

import java.util.*;
import vn.vietnamtourism.profile.domain.AccountProfile;

public interface AccountRepository {
    Optional<AccountProfile> findBySubject(UUID subject);
    void bootstrap(UUID subject,String username,String displayName);
}
