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

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registra un nuevo usuario y devuelve Token + Datos del usuario.
     */
    public AuthenticationResponse register(RegisterRequest request) {
        // Validación de edad profesional
        if (request.getBirthDate().plusYears(15).isAfter(LocalDate.now())) {
            throw new RuntimeException("Debes tener al menos 15 años para registrarte.");
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .birthDate(request.getBirthDate())
                .role(Role.USER) // Por defecto asignamos el rol USER
                .build();

        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        // 🚨 AQUÍ AGREGAMOS EMAIL Y ROLE PARA QUE EL FRONTEND LOS RECIBA
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Autentica al usuario y devuelve Token + Datos del usuario para el Frontend.
     */
    public AuthenticationResponse authenticate(LoginRequest request) {
        // 1. Verificación de credenciales con Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Si la línea anterior falla, lanza una excepción automáticamente.
        // Si llega aquí, es porque el login es correcto.
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Error crítico: Usuario no encontrado tras autenticación."));

        var jwtToken = jwtService.generateToken(user);

        // 3. 🚨 CONSTRUIMOS LA RESPUESTA COMPLETA CON EL BUILDER
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}