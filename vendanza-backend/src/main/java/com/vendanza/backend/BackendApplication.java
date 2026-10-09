package com.vendanza.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    // ADICIONA ESTE BLOCO DE CÓDIGO (É o "Guarda-Costas" Global)
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Aplica a todos os links da tua API
                        .allowedOriginPatterns("*") // Permite de qualquer origem (o teu localhost:5500)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // O "OPTIONS" resolve o teu erro atual!
                        .allowedHeaders("*")
                        .allowCredentials(false);
            }
        };
    }
}