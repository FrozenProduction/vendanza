# Etapa 1: Construir o projeto com Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Correr o projeto de forma leve
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copia o ficheiro compilado da Etapa 1
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta 8080 para a Internet
EXPOSE 8080

# Comando de arranque com limite de 256MB de RAM para não estourar o servidor gratuito
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]