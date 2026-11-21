package vn.vietnamtourism.profile.infrastructure;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.*;
import jakarta.ws.rs.ext.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.jboss.logging.Logger;
import vn.vietnamtourism.profile.api.dto.ApiError;
import vn.vietnamtourism.profile.application.ApiException;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<Throwable> {
    @Context ContainerRequestContext request;
    private static final Logger LOG = Logger.getLogger(ApiExceptionMapper.class);
    @Override public Response toResponse(Throwable error) {
        var requestId = request.getProperty(RequestIdFilter.KEY);
        String id = requestId == null ? UUID.randomUUID().toString() : requestId.toString();
        request.setProperty(RequestIdFilter.KEY,id);
        int status = error instanceof ApiException e ? e.status
            : error instanceof io.quarkus.security.UnauthorizedException || error instanceof io.quarkus.security.AuthenticationFailedException ? 401
            : error instanceof io.quarkus.security.ForbiddenException ? 403
            : error instanceof jakarta.validation.ConstraintViolationException ? 400
            : error instanceof jakarta.persistence.PersistenceException ? 503
            : error instanceof WebApplicationException e ? e.getResponse().getStatus() : 500;
        String code = error instanceof ApiException e ? e.code : switch (status) {
            case 400 -> "INVALID_ARGUMENT"; case 401 -> "UNAUTHENTICATED"; case 403 -> "FORBIDDEN";
            case 404 -> "NOT_FOUND"; case 405 -> "METHOD_NOT_ALLOWED"; case 503 -> "DEPENDENCY_UNAVAILABLE"; default -> "INTERNAL_ERROR";
        };
        String message = error instanceof ApiException ? error.getMessage() : "Không thể xử lý yêu cầu.";
        List<ApiError.FieldError> fields = error instanceof jakarta.validation.ConstraintViolationException e
            ? e.getConstraintViolations().stream().map(v -> new ApiError.FieldError(
                v.getPropertyPath().toString().replaceFirst(".*\\.",""), "Giá trị không hợp lệ.")).toList() : List.of();
        if (status >= 500) LOG.errorf("requestId=%s status=%d exception=%s", id, status, error.getClass().getName());
        return Response.status(status).type(MediaType.APPLICATION_JSON_TYPE)
            .header("X-Request-ID", id).header("Cache-Control", "no-store")
            .header("WWW-Authenticate",status==401?"Bearer":null)
            .entity(new ApiError(code, message, id, Instant.now(), fields)).build();
    }
}
