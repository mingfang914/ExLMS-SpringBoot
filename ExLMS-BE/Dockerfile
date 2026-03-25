# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/ExLMS-0.0.1-SNAPSHOT.jar app.jar

# Configuration via Env Vars (Defaults for Docker Compose)
ENV SERVER_PORT=8081

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
