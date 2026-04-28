/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.siatd_backend.service;

import com.example.siatd_backend.dto.AuthenticationResponse;
import com.example.siatd_backend.dto.LoginRequest;
import com.example.siatd_backend.dto.RegisterRequest;
import com.example.siatd_backend.model.User;
import com.example.siatd_backend.model.Role;
import com.example.siatd_backend.repository.UserRepository;
import com.example.siatd_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

;

@Service
@RequiredArgsConstructor // Esto genera el constructor para las inyecciones automáticas
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // --- MÉTODO DE REGISTRO (Con tus validaciones) ---
    public AuthenticationResponse register(RegisterRequest request) {
        // Validación de edad (Mínimo 15 años)
        if (request.getBirthDate().plusYears(15).isAfter(LocalDate.now())) {
            throw new RuntimeException("Debes tener al menos 15 años para registrarte.");
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .birthDate(request.getBirthDate())
                .role(Role.USER)
                .build();

        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken);
    }

    // --- EL MÉTODO QUE CONSULTASTE (Login) ---
    public AuthenticationResponse authenticate(LoginRequest request) {
        // 1. Cambiamos email() por getEmail() y password() por getPassword()
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Aquí también usamos getEmail()
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado tras autenticación"));

        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken);
    }
}
