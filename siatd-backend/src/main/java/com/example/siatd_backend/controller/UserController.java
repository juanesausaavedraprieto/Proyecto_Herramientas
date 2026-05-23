package com.example.siatd_backend.controller;

import com.example.siatd_backend.model.User;
import com.example.siatd_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 🚨 NUEVO ENDPOINT: Actualizar Perfil
    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> payload, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        user.setName(payload.get("name"));
        // Aquí podrías actualizar otros campos en el futuro
        
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}