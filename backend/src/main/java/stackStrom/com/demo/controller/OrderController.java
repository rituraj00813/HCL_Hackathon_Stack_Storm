package com.retail.ordering.controller;

import com.retail.ordering.dto.OrderRequest;
import com.retail.ordering.dto.OrderResponse;
import com.retail.ordering.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller layer for Order APIs.
 * Handles HTTP requests and delegates to OrderService.
 *
 * Endpoints:
 *   POST /api/orders          — Place a new order
 *   GET  /api/orders/{id}     — Get order by ID for current user
 *   GET  /api/orders          — Get all orders for current user
 *   GET  /api/orders/success  — Get latest successful order summary
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(authentication.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/success")
    public ResponseEntity<Map<String, Object>> getOrderSuccess(Authentication authentication) {
        OrderResponse latestOrder = orderService.getLatestOrderForUser(authentication.getName());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", "Order placed successfully.");
        payload.put("order", latestOrder);
        return ResponseEntity.ok(payload);
    }

    /**
     * GET /api/orders
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrdersForUser(Authentication authentication) {
        List<OrderResponse> responses = orderService.getOrdersForUser(authentication.getName());
        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/orders/{id}
     */
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<OrderResponse> getOrderById(
            Authentication authentication,
            @PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(authentication.getName(), id);
        return ResponseEntity.ok(response);
    }
}
