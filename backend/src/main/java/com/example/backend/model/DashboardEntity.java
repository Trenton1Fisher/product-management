package com.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "profile")
public class DashboardEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String user_id;
    private double total;
    private long total_inventory;

    public long getId() {
        return this.id;
    }

    public String getUserId() {
        return this.user_id;
    }

    public double getTotal() {
        return this.total;
    }

    public long getTotalInventory() {
        return this.total_inventory;
    }

    public void setUserId(String user_id){
        this.user_id = user_id;
    }

    public void setTotal(double total){
        this.total = total;
    }

    public void setTotalInventory(long total_inventory){
        this.total_inventory = total_inventory;
    }

}
