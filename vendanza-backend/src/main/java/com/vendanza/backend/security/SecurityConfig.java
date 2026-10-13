package com.vendanza.backend.security;

import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ATIVAR CORS
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // O redespacho para /error (qualquer excecao nao tratada) NAO passa pelo
                // JwtAuthenticationFilter, por isso era avaliado como anonimo e todas as
                // falhas do servidor respondiam 403 em vez de 500.
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers("/api/utilizadores/login").permitAll()
                // RegistO publico removido: nao existe UI de registo e esta regra permitia
                // criar contas (incluindo tipo 3 = direcao) sem qualquer autenticacao.
                .requestMatchers("/api/utilizadores/recuperar-passe").permitAll()
                // --- Escritas reservadas a direcao (o painel admin e o unico cliente delas) ---
                // Encargados criam/editam os seus proprios itens de inventario, pedem alugueres
                // e aulas privadas, e atualizam o seu perfil: isso mantem-se aberto a qualquer
                // utilizador autenticado (ver relatorio de revisao, secao de autorizacao).
                .requestMatchers(HttpMethod.POST, "/api/modalidade/**", "/api/tipos-aula/**",
                        "/api/estudios/**", "/api/horario/**", "/api/inscricoes/**",
                        "/api/pagamentos/**", "/api/aulas-privadas/guardar",
                        "/api/utilizadores/*/completo").hasRole("DIRECAO")
                .requestMatchers(HttpMethod.PUT, "/api/inventario/aluguer/**",
                        "/api/utilizadores/utilizador/**").hasRole("DIRECAO")
                .requestMatchers(HttpMethod.DELETE, "/api/modalidade/**", "/api/tipos-aula/**",
                        "/api/estudios/**", "/api/horario/**", "/api/inscricoes/**",
                        "/api/pagamentos/**", "/api/aulas-privadas/eliminar/**",
                        "/api/utilizadores/utilizador/**").hasRole("DIRECAO")
                .requestMatchers("/api/verificar/**").authenticated()
                .anyRequest().authenticated() 
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // Permite tudo (importante para o seu teste local)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
