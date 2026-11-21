# Profile migrations

V1 creates the public/private/access tables and runtime column grants. Run Flyway using `profile_migration` in one controlled migration job; API processes use `profile_runtime` and schema validation only. Never enable automatic create/update or Flyway clean. PostgreSQL/Testcontainers tests verify the schema, JPA queries, constraints and role isolation. Compose migration wiring and volume durability are verified in P0-08.
