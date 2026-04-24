
package com.example.siatd_backend.repository;

import com.example.siatd_backend.model.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, UUID> {
    // Aquí luego podemos agregar búsquedas personalizadas, ej: findByStatus()
}