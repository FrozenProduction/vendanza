package com.vendanza.backend.dto;

import com.vendanza.backend.models.Utilizador;

public class AuthResponse {
    private String token;
    private Utilizador utilizador;

    public AuthResponse(String token, Utilizador utilizador) {
        this.token = token;
        this.utilizador = utilizador;
    }

    public String getToken() { return token; }
    public Utilizador getUtilizador() { return utilizador; }
}
