package com.example.backend.repository;


import com.example.backend.model.DashboardEntity;
import com.example.backend.model.ProductEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import jakarta.transaction.Transactional;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    @Query("SELECT p FROM ProductEntity p WHERE p.dashboard_id = :dashboard")
    List<ProductEntity> getProductsByDashId(@Param("dashboard") DashboardEntity dashboard);

    @Query("SELECT p FROM ProductEntity p WHERE p.id = :product_id")
    Optional<ProductEntity> getProductsById(@Param("product_id") long product_id);

    @Modifying
    @Query("UPDATE ProductEntity p SET p.name = :name, p.description = :description, p.price = :price, p.quantity = :quantity WHERE p.id = :productId")
    void updateProduct(@Param("productId") long productId, @Param("name") String name, @Param("description") String description, @Param("price") BigDecimal price, @Param("quantity") long quantity);

}
