package com.example.siatd_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    private Long id = 1L; // Forzamos a que siempre sea el ID 1 (Fila única)

    private Integer topsisThreshold;
    private Boolean strictNormalization;

    @Column(columnDefinition = "TEXT")
    private String aiSystemPrompt;
    private String aiModel;

    public boolean isStrictNormalization() {
        return strictNormalization;
    }

    public void setStrictNormalization(boolean strictNormalization) {
        this.strictNormalization = strictNormalization;
    }
}
