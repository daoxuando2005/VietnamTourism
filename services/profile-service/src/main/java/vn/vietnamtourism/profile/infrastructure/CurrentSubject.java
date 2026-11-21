package vn.vietnamtourism.profile.infrastructure;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import java.util.UUID;
import org.eclipse.microprofile.jwt.JsonWebToken;
import vn.vietnamtourism.profile.application.ApiException;

@RequestScoped
public class CurrentSubject {
    @Inject JsonWebToken jwt;
    public UUID id() {
        if (!"authenticated".equals(jwt.getClaim("role"))) throw invalid();
        try { return UUID.fromString(jwt.getSubject()); }
        catch (RuntimeException e) { throw invalid(); }
    }
    private ApiException invalid() { return new ApiException(401,"UNAUTHENTICATED","Phiên đăng nhập không hợp lệ."); }
}
