
package com.example.siatd_backend.repository;

import com.example.siatd_backend.model.Decision;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, UUID> {
    List<Decision> findByUser_Email(String email);
}