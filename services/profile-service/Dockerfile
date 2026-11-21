FROM eclipse-temurin:21-jdk-alpine AS source
WORKDIR /build
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
COPY src src

FROM source AS build
RUN --mount=type=cache,id=profile-maven-cache,target=/root/.m2,sharing=locked ./mvnw -B -ntp -DskipTests package

FROM source AS migration-build
RUN --mount=type=cache,id=profile-maven-cache,target=/root/.m2,sharing=locked ./mvnw -B -ntp -DskipTests -Dquarkus.package.main-class=migrate package

FROM eclipse-temurin:21-jre-alpine AS runtime-base
WORKDIR /app
RUN addgroup -S app && adduser -S -G app -u 10001 app
USER 10001
EXPOSE 8081
ENTRYPOINT ["java","-jar","quarkus-run.jar"]

FROM runtime-base AS migrator
COPY --from=migration-build --chown=10001:10001 /build/target/quarkus-app/ ./

FROM runtime-base AS runtime
COPY --from=build --chown=10001:10001 /build/target/quarkus-app/ ./
