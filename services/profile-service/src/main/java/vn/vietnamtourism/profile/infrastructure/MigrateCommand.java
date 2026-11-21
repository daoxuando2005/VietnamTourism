package vn.vietnamtourism.profile.infrastructure;

import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;
import org.flywaydb.core.Flyway;

@QuarkusMain(name = "migrate")
public class MigrateCommand implements QuarkusApplication {
    @Override public int run(String... args) {
        String url = required("PROFILE_JDBC_URL");
        String user = required("PROFILE_MIGRATION_USER");
        String password = required("PROFILE_MIGRATION_PASSWORD");
        Flyway.configure().dataSource(url,user,password).locations("classpath:db/migration")
            .cleanDisabled(true).load().migrate();
        return 0;
    }
    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException("Missing " + name);
        return value;
    }
}
