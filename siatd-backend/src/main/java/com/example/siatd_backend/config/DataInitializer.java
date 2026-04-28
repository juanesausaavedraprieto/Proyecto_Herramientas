
package com.example.siatd_backend.config;

import com.example.siatd_backend.model.User;
import com.example.siatd_backend.model.Role;
import com.example.siatd_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate; // Para el arreglo rápido de la base de datos

    @Override
    public void run(String... args) {
        // 1. Crear ADMIN si no existe
        if (userRepository.findByEmail("admin@siatd.com").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Administrador")
                    .email("admin@siatd.com")
                    .password(passwordEncoder.encode("Admin123*"))
                    .birthDate(LocalDate.of(1990, 1, 1))
                    .role(Role.ADMIN)
                    .build());
        }

        // 2. Crear CLIENTE si no existe
        if (userRepository.findByEmail("cliente@siatd.com").isEmpty()) {
            User cliente = userRepository.save(User.builder()
                    .name("Juan Usuario")
                    .email("cliente@siatd.com")
                    .password(passwordEncoder.encode("Cliente123*"))
                    .birthDate(LocalDate.of(2000, 5, 15))
                    .role(Role.USER)
                    .build());

            // --- TRUCO MÁGICO PARA RECUPERAR TUS DATOS ---
            // Esto busca todas las decisiones que NO tienen dueño y se las da al cliente
            System.out.println("Vinculando decisiones huérfanas al cliente...");
            jdbcTemplate.execute("UPDATE decisions SET user_id = '" + cliente.getId() + "' WHERE user_id IS NULL");
        }
        
        System.out.println("✅ Datos de exposición listos.");
    }
}
