package com.example.siatd_backend.controller;

import com.example.siatd_backend.model.User;
import com.example.siatd_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") 
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(user);
    }
    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> payload, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (payload.containsKey("name") && !payload.get("name").trim().isEmpty()) {
            user.setName(payload.get("name"));
        }
        
        if (payload.containsKey("birthDate") && payload.get("birthDate") != null && !payload.get("birthDate").isEmpty()) {
            try {
                user.setBirthDate(LocalDate.parse(payload.get("birthDate"))); 
                
            } catch (Exception e) {
                System.err.println("Error al parsear la fecha: " + e.getMessage());
            }
        }
        
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}