FROM openjdk:17-jdk-slim
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
COPY src ./src
RUN ./mvnw clean package -DskipTests
EXPOSE 8080
CMD ["./mvnw", "spring-boot:run"]
