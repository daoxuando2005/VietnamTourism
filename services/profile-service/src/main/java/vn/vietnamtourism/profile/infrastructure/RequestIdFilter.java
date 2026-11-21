package vn.vietnamtourism.profile.infrastructure;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.*;
import jakarta.ws.rs.ext.Provider;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.jboss.logging.MDC;

@Provider @PreMatching @Priority(Priorities.AUTHENTICATION - 100)
public class RequestIdFilter implements ContainerRequestFilter, ContainerResponseFilter {
    public static final String KEY = "requestId";
    private static final Logger LOG = Logger.getLogger(RequestIdFilter.class);
    @Override public void filter(ContainerRequestContext request) {
        var supplied = request.getHeaderString("X-Request-ID");
        var id = supplied != null && supplied.matches("[a-f0-9]{32}|[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}")
            ? supplied : UUID.randomUUID().toString();
        request.setProperty(KEY, id);
        MDC.put(KEY, id);
    }
    @Override public void filter(ContainerRequestContext request, ContainerResponseContext response) {
        var id = request.getProperty(KEY);
        response.getHeaders().putSingle("X-Request-ID", id);
        response.getHeaders().putSingle("Cache-Control", "no-store");
        LOG.infof("requestId=%s method=%s status=%d", id, request.getMethod(), response.getStatus());
        MDC.remove(KEY);
    }
}
