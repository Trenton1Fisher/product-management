package com.example.backend.repository;


import com.example.backend.model.DashboardEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DashboardRepository extends JpaRepository<DashboardEntity, Long> {
    @Query("SELECT d FROM DashboardEntity d WHERE d.user_id = :user_id")
    Optional<DashboardEntity> getDashboardByUserId(@Param("user_id") String user_id);
}
