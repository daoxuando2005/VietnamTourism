package vn.vietnamtourism.profile.api;

import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.Map;
import vn.vietnamtourism.profile.application.AccountApplicationService;
import vn.vietnamtourism.profile.infrastructure.CurrentSubject;

@Path("/api/v1/admin/access") @Authenticated @Produces(MediaType.APPLICATION_JSON)
@org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement(name="bearerAuth")
public class AdminAccessResource {
    @Inject CurrentSubject subject;
    @Inject AccountApplicationService service;
    @GET @org.eclipse.microprofile.openapi.annotations.Operation(operationId="checkAdminAccess")
    public Map<String,String> get() { service.requireAdmin(subject.id()); return Map.of("role","ADMIN"); }
}
