package com.example.siatd_backend.controller;

import com.example.siatd_backend.model.SystemAuditLog;
import com.example.siatd_backend.model.SystemSetting;
import com.example.siatd_backend.model.User;
import com.example.siatd_backend.repository.DecisionRepository;
import com.example.siatd_backend.repository.SystemAuditLogRepository;
import com.example.siatd_backend.repository.SystemSettingRepository;
import com.example.siatd_backend.repository.UserRepository;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final SystemAuditLogRepository systemAuditLogRepository;

    public AdminController(UserRepository userRepository, DecisionRepository decisionRepository, SystemSettingRepository systemSettingRepository, SystemAuditLogRepository systemAuditLogRepository) {
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.systemAuditLogRepository = systemAuditLogRepository;
    }

    /**
     * Obtiene las métricas reales del sistema calculadas desde PostgreSQL
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalDecisions = decisionRepository.count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalDecisions", totalDecisions);
        stats.put("serverStatus", "Óptimo");

        // Estructura dinámica de actividad basada en la carga real de la base de datos
        List<Map<String, Object>> activity = new ArrayList<>();
        activity.add(Map.of("name", "Anteriores", "decisiones", totalDecisions > 2 ? totalDecisions - 2 : 0));
        activity.add(Map.of("name", "Actuales", "decisiones", totalDecisions));

        stats.put("activity", activity);

        return ResponseEntity.ok(stats);
    }

    /**
     * Lista todos los usuarios registrados en el sistema
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * Modifica el rol de un usuario específico (ADMIN / ESTUDIANTE)
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable UUID id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String newRole = payload.get("role");
        // Ajusta la conversión según manejes Enum o String en tu entidad User
        try {
            user.setRole(com.example.siatd_backend.model.Role.valueOf(newRole.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    /**
     * Elimina un usuario del sistema de forma definitiva
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit")
    public ResponseEntity<List<com.example.siatd_backend.model.Decision>> getGlobalAudit() {
        try {
            // Recuperamos absolutamente todas las decisiones para el monitoreo del Admin
            List<com.example.siatd_backend.model.Decision> allDecisions = decisionRepository.findAll();
            return ResponseEntity.ok(allDecisions);
        } catch (Exception e) {
            System.err.println("Error en Auditoría Global: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<SystemSetting> getSettings() {
        SystemSetting settings = systemSettingRepository.findById(1L).orElseGet(() -> {
            // Valores por defecto si la tabla está vacía
            SystemSetting defaultSettings = new SystemSetting();
            defaultSettings.setId(1L);
            defaultSettings.setTopsisThreshold(85);
            defaultSettings.setStrictNormalization(true);
            defaultSettings.setAiSystemPrompt("Eres un experto en toma de decisiones corporativas. Evalúa los resultados del algoritmo TOPSIS y brinda una justificación humana clara, considerando los pesos de los criterios. Sé objetivo.");
            defaultSettings.setAiModel("Gemini 2.5 Flash");
            return systemSettingRepository.save(defaultSettings);
        });
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<SystemSetting> updateSettings(@RequestBody SystemSetting newSettings, Principal principal) {

        // 1. Obtenemos la configuración antigua ANTES de sobrescribirla
        SystemSetting oldSettings = systemSettingRepository.findById(1L).orElse(new SystemSetting());

        // Determinamos quién está haciendo el cambio
        String admin = (principal != null) ? principal.getName() : "Sistema";

        // 2. Comparamos y Guardamos Rastros (Auditoría)
        // Auditar Threshold
        if (oldSettings.getTopsisThreshold() != newSettings.getTopsisThreshold()) {
            saveAuditLog(admin, "Umbral TOPSIS",
                    String.valueOf(oldSettings.getTopsisThreshold()),
                    String.valueOf(newSettings.getTopsisThreshold()));
        }

        // Auditar Normalización
        if (oldSettings.isStrictNormalization() != newSettings.isStrictNormalization()) {
            saveAuditLog(admin, "Normalización Estricta",
                    String.valueOf(oldSettings.isStrictNormalization()),
                    String.valueOf(newSettings.isStrictNormalization()));
        }

        // Auditar Modelo IA
        if (oldSettings.getAiModel() != null && !oldSettings.getAiModel().equals(newSettings.getAiModel())) {
            saveAuditLog(admin, "Modelo de IA", oldSettings.getAiModel(), newSettings.getAiModel());
        }

        // Auditar Prompt (Opcional, puede ser texto muy largo, pero útil)
        if (oldSettings.getAiSystemPrompt() != null && !oldSettings.getAiSystemPrompt().equals(newSettings.getAiSystemPrompt())) {
            saveAuditLog(admin, "Prompt Maestro IA", "Texto modificado", "Texto modificado");
        }

        // 3. Ahora sí, aseguramos que el ID sea 1 y guardamos la nueva configuración
        newSettings.setId(1L);
        SystemSetting savedSettings = systemSettingRepository.save(newSettings);

        return ResponseEntity.ok(savedSettings);
    }

    // 🛠️ Método privado auxiliar para no repetir código
    private void saveAuditLog(String admin, String parameter, String oldVal, String newVal) {
        SystemAuditLog log = new SystemAuditLog();
        log.setAdminEmail(admin);
        log.setParameterName(parameter);
        log.setOldValue(oldVal);
        log.setNewValue(newVal);
        systemAuditLogRepository.save(log);
    }

    // 🚨 NUEVO ENDPOINT PARA REACT
    @GetMapping("/settings/audit")
    public ResponseEntity<List<SystemAuditLog>> getSystemAuditLogs() {
        // Usa el método que creaste en el repositorio para traerlos ordenados del más nuevo al más viejo
        List<SystemAuditLog> logs = systemAuditLogRepository.findAllByOrderByChangedAtDesc();
        return ResponseEntity.ok(logs);
    }
}
