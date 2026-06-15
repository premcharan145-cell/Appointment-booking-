# Build Stage
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.war app.war

ENTRYPOINT ["java","-jar","app.war"]