package com.example.backend.controllers;

import com.example.backend.model.DashboardEntity;
import com.example.backend.model.ProductEntity;
import com.example.backend.repository.DashboardRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.request.CreateDashboardRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class DashboardController {
    @Autowired
    private DashboardRepository dashboardRepository;
    @Autowired
    private ProductRepository productRepository;

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/getDashboard")
    public Map<String,Object> getDashboard(@RequestParam(value = "user_id", defaultValue = "") String user_id){
        Optional<DashboardEntity> dashboardOptional = dashboardRepository.getDashboardByUserId(user_id);
        if(dashboardOptional.isPresent()){
            DashboardEntity dashboard = dashboardOptional.get();
            List<ProductEntity> products = productRepository.getProductsByDashId(dashboard);
            Map<String, Object> response = new HashMap<>();
            response.put("dashboard", dashboard);
            response.put("products", products);

            return response;
        }else{
            return null;
        }
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/createDashboard")
    public ResponseEntity<Map<String,Object>> createDashboard(@RequestBody Map<String, String> request) {
        String user_id = request.get("user_id");

        DashboardEntity dashboard = new DashboardEntity();
        dashboard.setUserId(user_id);
        dashboard.setTotal(0);
        dashboard.setTotalInventory(0);
        DashboardEntity saved_dashboard = dashboardRepository.save(dashboard);

        List<ProductEntity> products = new ArrayList<>();
        Map<String, Object> response = new HashMap<>();
        response.put("dashboard", saved_dashboard);
        response.put("products", products);

        return ResponseEntity.ok(response);
    }
}
