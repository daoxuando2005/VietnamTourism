package vn.vietnamtourism.profile;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.quarkus.test.common.QuarkusTestResource;
import io.restassured.specification.RequestSpecification;
import java.sql.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest @TestProfile(DatabaseTestProfile.class)
@QuarkusTestResource(value=PostgresResource.class,restrictToAnnotatedClass=true)
@QuarkusTestResource(value=JwtFixtureResource.class,restrictToAnnotatedClass=true)
class AccountSecurityTest {
    static final String A="00000000-0000-4000-8000-000000000010", B="00000000-0000-4000-8000-000000000011", ADMIN="00000000-0000-4000-8000-000000000012";
    static RequestSpecification as(String subject) { return given().port(8081).auth().oauth2(JwtFixtureResource.token(subject)); }
    @BeforeAll static void fixtures() throws SQLException {
        for (var entry:Map.of(A,"auth_a",B,"auth_b",ADMIN,"auth_admin").entrySet()) {
            as(entry.getKey()).contentType("application/json").body(Map.of("username",entry.getValue(),"displayName",entry.getValue()))
                .post("/api/v1/me/profile").then().statusCode(200).body("role",is("MEMBER"));
        }
        sql("UPDATE profile_access SET app_role='ADMIN' WHERE id='"+ADMIN+"'");
        sql("UPDATE profile_private SET phone_number='a-private',birth_date='2000-01-01' WHERE id='"+A+"'");
    }
    static void sql(String sql) throws SQLException { try(var c=PostgresResource.owner();var s=c.createStatement()){s.execute(sql);} }
    @Test void guestAndForgedIdentityAreDenied() {
        given().get("/api/v1/me/profile").then().statusCode(401).body("code",is("UNAUTHENTICATED"));
        given().header("X-User-ID",A).header("X-Role","ADMIN").get("/api/v1/admin/access").then().statusCode(401);
    }
    @Test void wrongSignatureIssuerAudienceExpirySubjectAndRoleAreRejected() {
        var invalid=new ArrayList<String>();
        invalid.add(JwtFixtureResource.token(A,Map.of(),true));
        invalid.add(JwtFixtureResource.token(A,Map.of("iss","https://other.invalid"),false));
        invalid.add(JwtFixtureResource.token(A,Map.of("aud","other"),false));
        invalid.add(JwtFixtureResource.token(A,Map.of("exp",Instant.now().minusSeconds(120).getEpochSecond()),false));
        invalid.add(JwtFixtureResource.token("not-a-uuid"));
        invalid.add(JwtFixtureResource.token(A,Map.of("role","service_role"),false));
        invalid.add("eyJhbGciOiJub25lIn0.eyJzdWIiOiJmb3JnZWQifQ.");
        for (String token:invalid) {
            var r=given().auth().oauth2(token).get("/api/v1/me/profile").then().statusCode(401).extract().response();
            assertEquals("UNAUTHENTICATED",r.jsonPath().getString("code"));
            assertEquals(r.header("X-Request-ID"),r.jsonPath().getString("requestId"));
        }
    }
    @Test void ownerScopeIgnoresClientIdAndPublicProfileHasNoContacts() {
        as(A).get("/api/v1/me/profile").then().statusCode(200).body("phoneNumber",is("a-private")).body("birthDate",is("2000-01-01"));
        as(B).header("X-User-ID",A).queryParam("userId",A).get("/api/v1/me/profile").then().statusCode(200).body("id",is(B)).body("phoneNumber",nullValue());
        var publicData=given().get("/api/v1/profiles/auth_a").then().statusCode(200).extract().jsonPath().getMap("");
        assertFalse(publicData.containsKey("phoneNumber")); assertFalse(publicData.containsKey("birthDate")); assertFalse(publicData.containsKey("role"));
    }
    @Test void trustedDatabaseRoleControlsAdminAndRevocationIsImmediate() throws SQLException {
        as(A).get("/api/v1/admin/access").then().statusCode(403).body("code",is("FORBIDDEN"));
        given().auth().oauth2(JwtFixtureResource.token(A,Map.of("groups",List.of("ADMIN"),"user_metadata",Map.of("role","admin")),false))
            .get("/api/v1/admin/access").then().statusCode(403);
        String token=JwtFixtureResource.token(ADMIN);
        given().auth().oauth2(token).get("/api/v1/admin/access").then().statusCode(200).body("role",is("ADMIN"));
        try {
            sql("UPDATE profile_access SET app_role='MEMBER' WHERE id='"+ADMIN+"'");
            given().auth().oauth2(token).get("/api/v1/admin/access").then().statusCode(403);
        } finally { sql("UPDATE profile_access SET app_role='ADMIN' WHERE id='"+ADMIN+"'"); }
    }
    @Test void blockingAccountAppliesToExistingTokenAndPublicRead() throws SQLException {
        String token=JwtFixtureResource.token(B);
        try {
            sql("UPDATE profile_public SET account_status='BLOCKED' WHERE id='"+B+"'");
            given().auth().oauth2(token).get("/api/v1/me/profile").then().statusCode(403).body("code",is("ACCOUNT_BLOCKED"));
            given().get("/api/v1/profiles/auth_b").then().statusCode(404);
            given().auth().oauth2(token).contentType("application/json").body(Map.of("username","auth_b","displayName","B"))
                .post("/api/v1/me/profile").then().statusCode(403);
        } finally { sql("UPDATE profile_public SET account_status='ACTIVE' WHERE id='"+B+"'"); }
    }
    @Test void bootstrapIsConcurrentAndIdempotentAndConflictIs409() throws Exception {
        String subject="00000000-0000-4000-8000-000000000014";
        var requests=new ArrayList<CompletableFuture<Void>>();
        for(int i=0;i<8;i++) requests.add(CompletableFuture.runAsync(()->as(subject).contentType("application/json")
            .body(Map.of("username","concurrent_user","displayName","New user")).post("/api/v1/me/profile").then().statusCode(200).body("id",is(subject)).body("role",is("MEMBER"))));
        CompletableFuture.allOf(requests.toArray(CompletableFuture[]::new)).get(30,TimeUnit.SECONDS);
        try(var c=PostgresResource.owner();var s=c.createStatement();var r=s.executeQuery("SELECT count(*) FROM profile_public WHERE id='"+subject+"'")) {
            assertTrue(r.next());assertEquals(1,r.getInt(1));
        }
        as("00000000-0000-4000-8000-000000000015").contentType("application/json").body(Map.of("username","auth_a","displayName","Conflict"))
            .post("/api/v1/me/profile").then().statusCode(409).body("code",is("USERNAME_TAKEN"));
    }
    @Test void invalidInputAndExtraRolePropertiesAreRejected() {
        as(A).contentType("application/json").body(Map.of("username","ab","displayName","A"))
            .post("/api/v1/me/profile").then().statusCode(400).body("code",is("INVALID_ARGUMENT"));
        as(A).contentType("application/json").body(Map.of("username","auth_a","displayName","A","role","ADMIN"))
            .post("/api/v1/me/profile").then().statusCode(400).body("code",is("INVALID_ARGUMENT"));
        as(A).contentType("application/json").body("null").post("/api/v1/me/profile").then().statusCode(400);
        as(A).get("/api/v1/me/profile").then().statusCode(200).body("role",is("MEMBER"));
    }
}
