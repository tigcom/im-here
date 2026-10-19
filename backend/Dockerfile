# -------------------------------------------------------------
# Stage 1: Build JAR bằng Maven và Eclipse Temurin JDK 21
# -------------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Copy Maven descriptor
COPY pom.xml .
# Copy mã nguồn
COPY src ./src

# Build gói jar và bỏ qua unit tests để tăng tốc deploy
RUN ./mvnw clean package -DskipTests 2>/dev/null || (apk add --no-cache maven && mvn clean package -DskipTests)

# -------------------------------------------------------------
# Stage 2: Runtime image siêu nhẹ với JRE 21 Alpine
# -------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Tạo thư mục uploads nội bộ (cho trường hợp không dùng Supabase)
RUN mkdir -p /app/uploads && addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

USER appuser

# Copy file jar đã build từ builder stage
COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Port mặc định của Spring Boot
EXPOSE 8080

# Cấu hình JVM tối ưu cho container RAM 512MB (Free Tier Render)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
