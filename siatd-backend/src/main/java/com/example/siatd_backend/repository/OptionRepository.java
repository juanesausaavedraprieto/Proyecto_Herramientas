
package com.example.siatd_backend.repository;


import com.example.siatd_backend.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface OptionRepository extends JpaRepository<Option, UUID> {
}