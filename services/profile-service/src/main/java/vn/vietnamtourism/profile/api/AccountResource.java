package vn.vietnamtourism.profile.api;

import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import vn.vietnamtourism.profile.api.dto.*;
import vn.vietnamtourism.profile.application.AccountApplicationService;
import vn.vietnamtourism.profile.infrastructure.CurrentSubject;

@Path("/api/v1/me/profile") @Authenticated
@Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON)
@SecurityRequirement(name="bearerAuth")
@org.eclipse.microprofile.openapi.annotations.security.SecurityScheme(securitySchemeName="bearerAuth",type=org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType.HTTP,scheme="bearer",bearerFormat="JWT")
public class AccountResource {
    @Inject CurrentSubject subject;
    @Inject AccountApplicationService service;
    @GET @Operation(operationId="getOwnProfile")
    public OwnProfileResponse get() { return service.own(subject.id()); }
    @POST @Operation(operationId="bootstrapProfile")
    public OwnProfileResponse bootstrap(@Valid @jakarta.validation.constraints.NotNull BootstrapRequest request) { return service.bootstrap(subject.id(),request); }
}
