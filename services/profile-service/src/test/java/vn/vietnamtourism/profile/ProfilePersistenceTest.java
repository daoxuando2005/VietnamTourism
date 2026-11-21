package vn.vietnamtourism.profile;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.quarkus.test.common.QuarkusTestResource;
import java.sql.*;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest @TestProfile(DatabaseTestProfile.class)
@QuarkusTestResource(value=PostgresResource.class, restrictToAnnotatedClass=true)
class ProfilePersistenceTest {
    @BeforeAll static void fixtures() throws SQLException {
        try (var c=PostgresResource.owner(); var s=c.createStatement()) {
            s.execute("INSERT INTO profile_public(id,username,display_name,bio) VALUES ('00000000-0000-4000-8000-000000000001','fixture_a','Người dùng A','Giới thiệu')");
            s.execute("INSERT INTO profile_private(id,phone_number) VALUES ('00000000-0000-4000-8000-000000000001','fixture-private')");
            s.execute("INSERT INTO profile_public(id,username,display_name,account_status) VALUES ('00000000-0000-4000-8000-000000000002','fixture_blocked','Blocked','BLOCKED')");
        }
    }
    @Test void readsRealJpaProfileWithoutPrivateFields() {
        given().get("/api/v1/profiles/fixture_a").then().statusCode(200)
            .body("displayName",is("Người dùng A")).body("bio",is("Giới thiệu"))
            .body("phoneNumber",nullValue()).body("birthDate",nullValue()).body("appRole",nullValue());
    }
    @Test void absentAndBlockedProfilesAreHidden() {
        given().get("/api/v1/profiles/fixture_missing").then().statusCode(404).body("code",is("PROFILE_NOT_FOUND"));
        given().get("/api/v1/profiles/fixture_blocked").then().statusCode(404);
    }
    @Test void realDatabaseMakesReadinessUp() {
        given().get("/q/health/ready").then().statusCode(200).body("status",is("UP"));
    }
    @Test void runtimeCannotChangeAuthoritativeRoleStatusOrSchema() throws SQLException {
        try (var c=PostgresResource.runtime(); var s=c.createStatement()) {
            try (var r=s.executeQuery("SELECT rolsuper,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname=current_user")) {
                assertTrue(r.next()); assertFalse(r.getBoolean(1)); assertFalse(r.getBoolean(2)); assertFalse(r.getBoolean(3));
            }
            for (String sql : new String[]{"CREATE TABLE illegal(id int)","UPDATE profile_access SET app_role='ADMIN'",
                "UPDATE profile_public SET account_status='BLOCKED'", "SELECT * FROM flyway_schema_history"}) {
                assertEquals("42501",assertThrows(SQLException.class,()->s.execute(sql)).getSQLState(),sql);
            }
        }
    }
    @Test void runtimeCannotConnectToAnotherDatabase() {
        var error=assertThrows(SQLException.class,()->DriverManager.getConnection(
            PostgresResource.url.replace("/profile","/isolation_probe"),"profile_runtime",PostgresResource.RUNTIME_PASSWORD));
        assertEquals("42501",error.getSQLState());
    }
    @Test void flywayIsVersionedAndRepeatableWithoutDataLoss() throws SQLException {
        var result=Flyway.configure().dataSource(PostgresResource.url,"profile_migration",PostgresResource.MIGRATION_PASSWORD)
            .locations("classpath:db/migration").cleanDisabled(true).load().migrate();
        assertEquals(0,result.migrationsExecuted);
        try (var c=PostgresResource.runtime(); var s=c.createStatement(); var r=s.executeQuery("SELECT count(*) FROM profile_public WHERE username='fixture_a'")) {
            assertTrue(r.next()); assertEquals(1,r.getInt(1));
        }
    }
    @Test void usernameAndStatusConstraintsAreEnforced() throws SQLException {
        try (var c=PostgresResource.owner(); var s=c.createStatement()) {
            assertEquals("23505",assertThrows(SQLException.class,()->s.execute("INSERT INTO profile_public(id,username,display_name) VALUES ('00000000-0000-4000-8000-000000000099','fixture_a','Duplicate')")).getSQLState());
            assertEquals("23514",assertThrows(SQLException.class,()->s.execute("UPDATE profile_public SET account_status='FAKE'")).getSQLState());
        }
    }
}
