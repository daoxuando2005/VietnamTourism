package vn.vietnamtourism.profile.api;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import vn.vietnamtourism.profile.application.ProfileApplicationService;
import vn.vietnamtourism.profile.api.dto.PublicProfileResponse;

@Path("/api/v1/profiles")
@Produces(MediaType.APPLICATION_JSON)
public class ProfileResource {
    @Inject ProfileApplicationService service;

    @GET @Path("/{username}")
    @Operation(operationId = "getPublicProfile", summary = "Đọc thông tin hồ sơ công khai")
    @APIResponse(responseCode = "200", description = "Public profile")
    @APIResponse(responseCode = "400", description = "Invalid username")
    @APIResponse(responseCode = "404", description = "Profile not found")
    @APIResponse(responseCode = "503", description = "Profile store unavailable")
    public PublicProfileResponse get(@PathParam("username") String username) { return service.getPublicProfile(username); }
    @GET @Path("/id/{id}") @Operation(operationId="getPublicProfileById")
    public PublicProfileResponse getById(@PathParam("id") java.util.UUID id) { return service.getPublicProfile(id); }
}
