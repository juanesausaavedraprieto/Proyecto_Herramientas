package com.example.siatd_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "criteria")
public class Criterion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Double weight; // Peso del 0.1 al 1.0

    @Column(name = "is_positive", nullable = false)
    private Boolean isPositive; // true = beneficio (ej. impacto), false = costo (ej. tiempo)

    // Relación: Muchos criterios pertenecen a una decisión
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_id", nullable = false)
    @JsonIgnore // Evita un bucle infinito al convertir a JSON
    private Decision decision;
}
