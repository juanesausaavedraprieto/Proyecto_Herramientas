package com.example.siatd_backend.repository;

import com.example.siatd_backend.model.SystemAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SystemAuditLogRepository extends JpaRepository<SystemAuditLog, Long> {
    List<SystemAuditLog> findAllByOrderByChangedAtDesc();
}