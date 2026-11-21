package vn.vietnamtourism.profile;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class ProfileResourceTest {
    @Test void processIsLiveButDatabaseReadinessIsDown() {
        given().get("/q/health/live").then().statusCode(200).body("status",is("UP"));
        given().get("/q/health/ready").then().statusCode(503).body("status",is("DOWN"));
    }
    @Test void unavailableDatabaseReturnsStructured503() {
        var response = given().get("/api/v1/profiles/traveler").then().statusCode(503)
            .body("code",is("DEPENDENCY_UNAVAILABLE"))
            .body("errors",empty()).body("timestamp",notNullValue()).extract().response();
        assertEquals(response.header("X-Request-ID"),response.jsonPath().getString("requestId"));
        assertFalse(response.asString().contains("password"));
    }
    @Test void invalidUsernameIs400AndKeepsValidRequestId() {
        var id = "00000000-0000-4000-8000-000000000001";
        given().header("X-Request-ID",id).get("/api/v1/profiles/ab")
            .then().statusCode(400).header("X-Request-ID",id)
            .body("code",is("INVALID_ARGUMENT")).body("requestId",is(id));
    }
    @Test void unsafeRequestIdIsReplaced() {
        given().header("X-Request-ID","untrusted-identifier").get("/api/v1/profiles/ab")
            .then().statusCode(400).header("X-Request-ID",not("untrusted-identifier"));
    }
    @Test void privateAndWriteRoutesAreNotExposed() {
        given().header("X-User-ID","forged").get("/api/v1/me/profile").then().statusCode(404);
        given().contentType("application/json").body("{}").post("/api/v1/profiles/traveler").then().statusCode(405);
    }
    @Test void runtimeOpenApiContainsOnlyImplementedPublicRoute() {
        given().queryParam("format","JSON").get("/q/openapi").then().statusCode(200)
            .body("paths.'/api/v1/profiles/{username}'.get.operationId",is("getPublicProfile"));
    }
}
