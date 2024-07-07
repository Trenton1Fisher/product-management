package com.example.backend.controllers;

import com.example.backend.model.DashboardEntity;
import com.example.backend.model.ProductEntity;
import com.example.backend.repository.DashboardRepository;
import com.example.backend.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;

import jakarta.transaction.Transactional;

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
        BigDecimal price = BigDecimal.ZERO;
        if (priceObj instanceof Integer) {
            price = BigDecimal.valueOf((int) priceObj);
        } else if (priceObj instanceof Double) {
            price = BigDecimal.valueOf((double) priceObj);
        }

        price = price.setScale(2, RoundingMode.HALF_UP);

        ProductEntity product = new ProductEntity();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setQuantity(quantity);

        DashboardEntity dashboard = dashboardRepository.getDashboardById(dashboard_id).orElse(null);
        if (dashboard == null) {
            return ResponseEntity.notFound().build();
        }

        BigDecimal productPrice = product.getPrice();
        BigDecimal productQuantity = BigDecimal.valueOf(product.getQuantity());
        BigDecimal tempTotal = BigDecimal.valueOf(dashboard.getTotal()).add(productPrice.multiply(productQuantity));
        long tempInventory = dashboard.getTotalInventory() + product.getQuantity();

        dashboard.setTotal(tempTotal.doubleValue());
        dashboard.setTotalInventory(tempInventory);
        DashboardEntity saved_dashboard = dashboardRepository.save(dashboard);

        product.setDashboard_id(saved_dashboard);
        ProductEntity saved_product = productRepository.save(product);

        Map<String, Object> response = new HashMap<>();
        response.put("dashboard", saved_dashboard);
        response.put("product", saved_product);

        return ResponseEntity.ok().body(response);

    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/deleteProduct")
    public ResponseEntity<DashboardEntity>  deleteProduct(@RequestBody Map<String, Object> request){
        long dashboard_id = Long.parseLong(request.get("dashboard_id").toString());
        long product_id = Long.parseLong(request.get("product_id").toString());

        Optional<ProductEntity> productOpt = productRepository.getProductsById(product_id);
        DashboardEntity dashboard = dashboardRepository.getDashboardById(dashboard_id).orElse(null);
        DashboardEntity saved_dashboard = new DashboardEntity();

        if(productOpt.isPresent() && dashboard != null){
            ProductEntity deleteProduct =  productOpt.get();
            BigDecimal price = deleteProduct.getPrice();
            BigDecimal quantity = BigDecimal.valueOf(deleteProduct.getQuantity());
            BigDecimal tempTotal = BigDecimal.valueOf(dashboard.getTotal()).subtract(price.multiply(quantity));
            long tempQuantity = dashboard.getTotalInventory() - deleteProduct.getQuantity();

            tempTotal = tempTotal.setScale(2, RoundingMode.HALF_UP);

            dashboard.setTotal(tempTotal.doubleValue());
            dashboard.setTotalInventory(tempQuantity);
            saved_dashboard = dashboardRepository.save(dashboard);
            productRepository.delete(deleteProduct);
        }

        return ResponseEntity.ok(saved_dashboard);
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/updateProduct")
    @Transactional
    public ResponseEntity<DashboardEntity> updateProduct(@RequestBody Map<String, Object> request) {
        long product_id = Long.parseLong(request.get("product_id").toString());

        long dashboard_id = 0;
        if (request.get("dashboard_id") instanceof Integer) {
            dashboard_id = ((Integer) request.get("dashboard_id")).longValue();
        } else if (request.get("dashboard_id") instanceof Long) {
            dashboard_id = (Long) request.get("dashboard_id");
        }

        String name = (String) request.get("name");
        String description = (String) request.get("description");
        long quantity = 0;
        if (request.get("quantity") instanceof Integer) {
            quantity = ((Integer) request.get("quantity")).longValue();
        } else if (request.get("quantity") instanceof Long) {
            quantity = (Long) request.get("quantity");
        }

        Object priceObj = request.get("price");
        BigDecimal price = BigDecimal.ZERO;
        if (priceObj instanceof Integer) {
            price = BigDecimal.valueOf((int) priceObj);
        } else if (priceObj instanceof Double) {
            price = BigDecimal.valueOf((double) priceObj);
        } else if (priceObj instanceof BigDecimal) {
            price = (BigDecimal) priceObj;
        }

        Optional<ProductEntity> oldProduct = productRepository.getProductsById(product_id);
        DashboardEntity dashboard = dashboardRepository.getDashboardById(dashboard_id).orElse(null);
        DashboardEntity saved_dashboard = new DashboardEntity();

        if (oldProduct.isPresent() && dashboard != null) {
            ProductEntity deleteProduct = oldProduct.get();
            BigDecimal oldPrice = deleteProduct.getPrice();
            long oldQuantity = deleteProduct.getQuantity();

            // Subtract the old total and add the new total in
            BigDecimal newTotal = BigDecimal.valueOf(dashboard.getTotal())
                    .subtract(oldPrice.multiply(BigDecimal.valueOf(oldQuantity)))
                    .add(price.multiply(BigDecimal.valueOf(quantity)));
            newTotal = newTotal.setScale(2, RoundingMode.HALF_UP);
            dashboard.setTotal(newTotal.doubleValue());

            // Subtract the old quantity and add the new quantity in
            long newQuantity = dashboard.getTotalInventory() - oldQuantity;
            newQuantity = newQuantity + quantity;
            dashboard.setTotalInventory(newQuantity);

            productRepository.updateProduct(product_id, name, description, price, quantity);
            saved_dashboard = dashboardRepository.save(dashboard);
            return ResponseEntity.ok(saved_dashboard);
        }
        return null;
    }
}
