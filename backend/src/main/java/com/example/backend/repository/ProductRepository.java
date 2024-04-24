package com.example.backend.repository;


import com.example.backend.model.ProductEntity;

import org.springframework.data.repository.CrudRepository;

public interface ProductRepository extends CrudRepository<ProductEntity, Long> {
    //Add item
    //Update Item
    //Delete Item
}
