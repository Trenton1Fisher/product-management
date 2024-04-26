package com.example.backend.controllers;

import com.example.backend.model.DashboardEntity;
import com.example.backend.model.ProductEntity;
import com.example.backend.repository.DashboardRepository;
import com.example.backend.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DashboardRepository dashboardRepository;

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/addProduct")
    public ResponseEntity<Map<String,Object>> addProduct(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        int quantity = (int) request.get("quantity");
        long dashboard_id = (int) request.get("dashboard_id");

        Object priceObj = request.get("price");
        double price = 0;
        if (priceObj instanceof Integer) {
            price = (int) priceObj;
        } else if (priceObj instanceof Double) {
            price = (double) priceObj;
        }
        DecimalFormat df = new DecimalFormat("#.##");
        df.setMinimumFractionDigits(2);
        df.setMaximumFractionDigits(2);
        double formattedPrice = Double.parseDouble(df.format(price));

        ProductEntity product = new ProductEntity();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(formattedPrice);
        product.setQuantity(quantity);

        DashboardEntity dashboard = dashboardRepository.getDashboardById(dashboard_id).orElse(null);
        DashboardEntity saved_dashboard = new DashboardEntity();
        if(dashboard == null){
            return null;
        }else{
            double tempTotal = dashboard.getTotal() + product.getPrice() * product.getQuantity();
            dashboard.setTotal(tempTotal);
            long tempInventory = dashboard.getTotalInventory() + product.getQuantity();
            dashboard.setTotalInventory(tempInventory);
            saved_dashboard = dashboardRepository.save(dashboard);
            product.setDashboard_id(dashboard);
        }
        ProductEntity saved_product = productRepository.save(product);

        Map<String, Object> response = new HashMap<>();
        response.put("dashboard", saved_dashboard);
        response.put("product", saved_product);

        return ResponseEntity.ok().body(response);

    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/deleteProduct")
    public ResponseEntity<DashboardEntity>  deleteProduct(@RequestBody Map<String, Object> request){
        long dashboard_id = (int) request.get("dashboard_id");
        long product_id = (int) request.get("product_id");

        Optional<ProductEntity> product = productRepository.getProductsById(product_id);
        DashboardEntity dashboard = dashboardRepository.getDashboardById(dashboard_id).orElse(null);
        DashboardEntity saved_dashboard = new DashboardEntity();

        if(product.isPresent()){
            ProductEntity deleteProduct =  product.get();
            double temp_total = dashboard.getTotal() - deleteProduct.getPrice() * deleteProduct.getQuantity();
            long temp_quantity = dashboard.getTotalInventory() - deleteProduct.getQuantity();
            dashboard.setTotal(temp_total);
            dashboard.setTotalInventory(temp_quantity);
            saved_dashboard = dashboardRepository.save(dashboard);
            productRepository.delete(deleteProduct);
        }

        return ResponseEntity.ok().body(saved_dashboard);
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/updateProduct")
    public void updateProduct(){

    }

}
