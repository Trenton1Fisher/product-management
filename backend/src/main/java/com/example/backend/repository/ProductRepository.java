package com.example.backend.repository;


import com.example.backend.model.DashboardEntity;
import com.example.backend.model.ProductEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    @Query("SELECT p FROM ProductEntity p WHERE p.dashboard_id = :dashboard")
    List<ProductEntity> getProductsByDashId(@Param("dashboard") DashboardEntity dashboard);

}
