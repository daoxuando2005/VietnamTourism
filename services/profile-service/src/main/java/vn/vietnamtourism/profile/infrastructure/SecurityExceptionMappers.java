package vn.vietnamtourism.profile.infrastructure;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.*;
import vn.vietnamtourism.profile.application.ApiException;

public final class SecurityExceptionMappers {
    @Provider @Priority(Priorities.AUTHENTICATION)
    public static class Unauthorized implements ExceptionMapper<io.quarkus.security.UnauthorizedException> {
        @Inject ApiExceptionMapper errors;
        @Override public Response toResponse(io.quarkus.security.UnauthorizedException e) {
            return errors.toResponse(new ApiException(401,"UNAUTHENTICATED","Vui lòng đăng nhập."));
        }
    }
    @Provider @Priority(Priorities.AUTHENTICATION)
    public static class AuthenticationFailed implements ExceptionMapper<io.quarkus.security.AuthenticationFailedException> {
        @Inject ApiExceptionMapper errors;
        @Override public Response toResponse(io.quarkus.security.AuthenticationFailedException e) {
            return errors.toResponse(new ApiException(401,"UNAUTHENTICATED","Phiên đăng nhập không hợp lệ hoặc đã hết hạn."));
        }
    }
    @Provider @Priority(Priorities.AUTHENTICATION)
    public static class Forbidden implements ExceptionMapper<io.quarkus.security.ForbiddenException> {
        @Inject ApiExceptionMapper errors;
        @Override public Response toResponse(io.quarkus.security.ForbiddenException e) {
            return errors.toResponse(new ApiException(403,"FORBIDDEN","Bạn không có quyền thực hiện thao tác này."));
        }
    }
}
