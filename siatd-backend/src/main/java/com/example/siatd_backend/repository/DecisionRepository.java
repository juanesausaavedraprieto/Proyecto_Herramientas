package com.example.siatd_backend.repository;

import com.example.siatd_backend.model.Decision;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, UUID> {

    List<Decision> findByUser_Email(String email);

    @Query("SELECT d FROM Decision d WHERE d.user.email = :email AND d.recommendedOption IS NOT NULL AND d.feedbackScore IS NULL AND d.createdAt < :thresholdDate")
    List<Decision> findPendingFeedback(@Param("email") String email, @Param("thresholdDate") LocalDateTime thresholdDate);

}
