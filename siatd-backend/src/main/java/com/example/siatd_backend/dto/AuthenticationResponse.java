package com.example.siatd_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder // 👈 Crucial para que funcione el service de abajo
public class AuthenticationResponse {
    private String token;
    private String name; 
}