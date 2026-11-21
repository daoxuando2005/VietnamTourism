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
        int status = error instanceof ApiException e ? e.status
            : error instanceof WebApplicationException e ? e.getResponse().getStatus() : 500;
        String code = error instanceof ApiException e ? e.code : switch (status) {
            case 400 -> "INVALID_ARGUMENT"; case 401 -> "UNAUTHENTICATED"; case 403 -> "FORBIDDEN";
            case 404 -> "NOT_FOUND"; case 405 -> "METHOD_NOT_ALLOWED"; default -> "INTERNAL_ERROR";
        };
        String message = error instanceof ApiException ? error.getMessage() : "Không thể xử lý yêu cầu.";
        if (status >= 500) LOG.errorf("requestId=%s status=%d exception=%s", id, status, error.getClass().getName());
        return Response.status(status).type(MediaType.APPLICATION_JSON_TYPE)
            .header("X-Request-ID", id).header("Cache-Control", "no-store")
            .entity(new ApiError(code, message, id, Instant.now(), List.of())).build();
    }
}
