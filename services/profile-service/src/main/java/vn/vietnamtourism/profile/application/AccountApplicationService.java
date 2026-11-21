package vn.vietnamtourism.profile.application;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;
import vn.vietnamtourism.profile.api.dto.*;
import vn.vietnamtourism.profile.domain.AccountProfile;
import vn.vietnamtourism.profile.repository.AccountRepository;

@ApplicationScoped
public class AccountApplicationService {
    @Inject AccountRepository repository;
    public OwnProfileResponse own(UUID subject) { return response(active(subject)); }
    public void requireAdmin(UUID subject) {
        if (!active(subject).role().equals("ADMIN")) throw new ApiException(403,"FORBIDDEN","Bạn không có quyền quản trị.");
    }
    @Transactional
    public OwnProfileResponse bootstrap(UUID subject,BootstrapRequest request) {
        var existing=repository.findBySubject(subject);
        if (existing.isPresent()) return response(requireActive(existing.get()));
        repository.bootstrap(subject,request.username(),request.displayName().trim());
        return own(subject);
    }
    private AccountProfile active(UUID subject) {
        return requireActive(repository.findBySubject(subject).orElseThrow(()->new ApiException(404,"PROFILE_NOT_FOUND","Hồ sơ chưa được tạo.")));
    }
    private AccountProfile requireActive(AccountProfile p) {
        if (!p.status().equals("ACTIVE")) throw new ApiException(403,"ACCOUNT_BLOCKED","Tài khoản đã bị khóa.");
        return p;
    }
    private OwnProfileResponse response(AccountProfile account) {
        var p=account.profile();
        return new OwnProfileResponse(p.id(),p.username(),p.displayName(),p.bio(),p.avatarUrl(),p.coverUrl(),p.website(),p.location(),p.createdAt(),account.birthDate(),account.phoneNumber(),account.role());
    }
}
