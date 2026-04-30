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
     * Registra un nuevo usuario y devuelve su primer Token + Nombre.
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
                .role(Role.USER)
                .build();

        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        // Retornamos el objeto con el nombre incluido
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .build();
    }

    /**
     * Autentica al usuario y devuelve el Token + Nombre para el Sidebar.
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

        // 3. Construimos la respuesta con el nombre para que el Front la guarde
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .name(user.getName()) // 👈 ESTA ES LA MAGIA
                .build();
    }
}