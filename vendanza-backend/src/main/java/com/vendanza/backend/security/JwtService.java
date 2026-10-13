package com.vendanza.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    /** Chave de assinatura. Vem de JWT_SECRET (variavel de ambiente no Render).
     *  O fallback abaixo existe so para o servico nao parar enquanto o JWT_SECRET ainda
     *  nao estiver definido: enquanto isto aparecer no codigo, qualquer pessoa que veja o
     *  repositorio pode forjar um token. Definir JWT_SECRET e apagar esta constante. */
    private static final String SECRET_KEY = resolverChave();
    private static final String CLAIM_TIPO = "tipo";
    private static final String CHAVE_DEV = "sua_chave_secreta_muito_longa_e_segura_para_o_vendanza_backend";

    private static String resolverChave() {
        String doAmbiente = System.getenv("JWT_SECRET");
        if (doAmbiente != null && doAmbiente.trim().length() >= 32) {
            return doAmbiente.trim();
        }
        System.out.println("[SEGURANCA] JWT_SECRET ausente ou com menos de 32 caracteres — a usar a\n"
                + "chave de desenvolvimento que esta no repositorio. Definir JWT_SECRET no Render.");
        return CHAVE_DEV;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(String email) {
        return generateToken(new HashMap<>(), email);
    }

    /** Token com o tipo do utilizador (1=docente, 2=encarregado, 3=direcao).
     *  O tipo vai no claim e e o que as regras de autorizacao usam. */
    public String generateToken(String email, Integer tipo) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TIPO, tipo);
        return generateToken(claims, email);
    }

    public Integer extractTipo(String token) {
        Object tipo = extractClaim(token, claims -> claims.get(CLAIM_TIPO));
        return tipo instanceof Number ? ((Number) tipo).intValue() : null;
    }

    public String generateToken(Map<String, Object> extraClaims, String email) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 horas
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, String email) {
        final String username = extractUsername(token);
        return (username.equals(email)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = SECRET_KEY.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
