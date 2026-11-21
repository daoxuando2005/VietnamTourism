package vn.vietnamtourism.profile;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import java.sql.*;
import java.util.Map;
import org.flywaydb.core.Flyway;
import org.testcontainers.postgresql.PostgreSQLContainer;

public class PostgresResource implements QuarkusTestResourceLifecycleManager {
    private PostgreSQLContainer postgres;
    public static String url;
    public static final String RUNTIME_PASSWORD = "fixture-runtime-only";
    public static final String MIGRATION_PASSWORD = "fixture-migration-only";

    @Override public Map<String,String> start() {
        postgres = new PostgreSQLContainer("postgres:17.12-alpine").withDatabaseName("postgres");
        postgres.start();
        try (var connection = postgres.createConnection(""); var s = connection.createStatement()) {
            s.execute("CREATE ROLE profile_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '" + RUNTIME_PASSWORD + "'");
            s.execute("CREATE ROLE profile_migration LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '" + MIGRATION_PASSWORD + "'");
            s.execute("CREATE DATABASE profile OWNER profile_migration");
            s.execute("REVOKE ALL ON DATABASE profile FROM PUBLIC");
            s.execute("GRANT CONNECT ON DATABASE profile TO profile_runtime");
            s.execute("CREATE DATABASE isolation_probe");
            s.execute("REVOKE ALL ON DATABASE isolation_probe FROM PUBLIC");
        } catch (SQLException e) { throw new IllegalStateException(e); }
        url = postgres.getJdbcUrl().replace("/postgres", "/profile");
        Flyway.configure().dataSource(url,"profile_migration",MIGRATION_PASSWORD)
            .cleanDisabled(true).locations("classpath:db/migration").load().migrate();
        return Map.of("quarkus.datasource.jdbc.url",url,
            "quarkus.datasource.username","profile_runtime","quarkus.datasource.password",RUNTIME_PASSWORD,
            "quarkus.datasource.active","true","quarkus.hibernate-orm.active","true",
            "PROFILE_PERSISTENCE_ENABLED","true");
    }
    @Override public void stop() { if (postgres != null) postgres.stop(); }
    public static Connection owner() throws SQLException { return DriverManager.getConnection(url,"profile_migration",MIGRATION_PASSWORD); }
    public static Connection runtime() throws SQLException { return DriverManager.getConnection(url,"profile_runtime",RUNTIME_PASSWORD); }
}
