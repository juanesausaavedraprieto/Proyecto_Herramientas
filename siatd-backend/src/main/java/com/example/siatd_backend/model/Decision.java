package com.example.siatd_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "decisions")
public class Decision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DecisionStatus status = DecisionStatus.DRAFT;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- RELACIONES CON MANEJO DE RECURSIÓN ---
    @JsonManagedReference // 👈 Indica que Decision "manda" en la serialización de Criteria
    @OneToMany(mappedBy = "decision", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Criterion> criteria = new ArrayList<>();

    @JsonManagedReference // 👈 Indica que Decision "manda" en la serialización de Options
    @OneToMany(mappedBy = "decision", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Option> options = new ArrayList<>();

    // ------------------------------------------
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"decisions", "password"}) 
    private User user;

    @Column(name = "stress_level")
    private Integer stressLevel = 1;

    @Column(name = "urgency_score")
    private Integer urgencyScore = 1;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Map<String, Double>> evaluationMatrix;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recommended_option_id")
    private Option recommendedOption;

    @Column(columnDefinition = "TEXT")
    private String justification;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Double> finalScores;
    @Column(columnDefinition = "TEXT")
    private String recommendations; // Nuevo campo en PostgreSQL para las sugerencias de la IA
}
