package backend.support;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.flywaydb.core.Flyway;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

public abstract class PostgresTestSupport {
    protected static final String URL = System.getenv("TASK2_TEST_DB_URL");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) throws SQLException {
        if (URL == null || !URL.matches("jdbc:postgresql://(127\\.0\\.0\\.1|localhost):[0-9]+/task2_test")) {
            throw new IllegalStateException("Only an explicit disposable loopback task2_test database is allowed");
        }
        Flyway flyway = Flyway.configure().dataSource(URL, "task2_migrator", "")
                .defaultSchema("public").load();
        flyway.migrate();
        assertThat(flyway.validateWithResult().validationSuccessful).isTrue();
        assertThat(flyway.migrate().migrationsExecuted).isZero();
        try (Connection admin = adminConnection(); var statement = admin.createStatement()) {
            statement.execute("GRANT USAGE ON SCHEMA public TO task2_runtime");
            statement.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.users, public.sessions, "
                    + "public.projects, public.tasks TO task2_runtime");
        }
        registry.add("spring.datasource.url", () -> URL);
        registry.add("spring.datasource.username", () -> "task2_runtime");
        registry.add("spring.datasource.password", () -> "");
        registry.add("spring.flyway.url", () -> URL);
        registry.add("spring.flyway.user", () -> "task2_migrator");
        registry.add("spring.flyway.password", () -> "");
    }

    protected static Connection adminConnection() throws SQLException {
        return DriverManager.getConnection(URL, "task2_admin", "");
    }

}
