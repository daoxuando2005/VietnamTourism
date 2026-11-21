package vn.vietnamtourism.profile;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import vn.vietnamtourism.profile.application.*;
import vn.vietnamtourism.profile.domain.PublicProfile;
import vn.vietnamtourism.profile.repository.ProfileRepository;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileApplicationServiceTest {
    private final ProfileRepository repository = mock(ProfileRepository.class);
    private final ProfileApplicationService service = new ProfileApplicationService(repository);

    @Test void returnsOnlyPublicProfileFields() {
        var id = UUID.fromString("00000000-0000-4000-8000-000000000001");
        when(repository.findPublicByUsername("traveler")).thenReturn(Optional.of(new PublicProfile(
            id,"traveler","Traveler","Bio",null,null,null,"Vietnam",Instant.parse("2026-11-21T00:00:00Z"))));
        var response = service.getPublicProfile("traveler");
        assertEquals(id, response.id());
        assertEquals("traveler", response.username());
        assertEquals(Instant.parse("2026-11-21T00:00:00Z"),response.createdAt());
    }
    @Test void invalidUsernameNeverQueriesDatabase() {
        for (var username : new String[]{"ab", "UPPER", "abc' OR 1=1", "a".repeat(41)}) {
            assertEquals(400, assertThrows(ApiException.class, () -> service.getPublicProfile(username)).status);
        }
        verifyNoInteractions(repository);
    }
    @Test void missingOrHiddenProfileIs404() {
        when(repository.findPublicByUsername("missing")).thenReturn(Optional.empty());
        var error = assertThrows(ApiException.class, () -> service.getPublicProfile("missing"));
        assertEquals(404,error.status);
        assertEquals("PROFILE_NOT_FOUND",error.code);
    }
    @Test void dependencyFailureIsNotReportedAsNotFound() {
        when(repository.findPublicByUsername("traveler")).thenThrow(new ApiException(503,"DEPENDENCY_UNAVAILABLE","Unavailable"));
        assertEquals(503,assertThrows(ApiException.class, () -> service.getPublicProfile("traveler")).status);
    }
}
