package com.example.backend.controllers;

import com.example.backend.model.DashboardEntity;
import com.example.backend.repository.DashboardRepository;
import com.example.backend.request.CreateDashboardRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
public class DashboardController {
    @Autowired
    private DashboardRepository dashboardRepository;

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/getDashboard")
    public DashboardEntity getDashboard(@RequestParam(value = "user_id", defaultValue = "") String user_id){
        Optional<DashboardEntity> dashboard = dashboardRepository.getDashboardByUserId(user_id);
        return dashboard.orElse(null);
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/createDashboard")
    public ResponseEntity<DashboardEntity> createDashboard(@RequestBody CreateDashboardRequest request) {
        String user_id = request.getUserId();

        DashboardEntity dashboard = new DashboardEntity();
        dashboard.setUserId(user_id);
        dashboard.setTotal(0);
        dashboard.setTotalInventory(0);
        DashboardEntity saved_dashboard = dashboardRepository.save(dashboard);

        return ResponseEntity.ok(saved_dashboard);
    }
}
