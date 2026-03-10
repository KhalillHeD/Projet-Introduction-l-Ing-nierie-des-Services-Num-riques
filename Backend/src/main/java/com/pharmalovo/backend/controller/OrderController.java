package com.pharmalovo.backend.controller;

import com.pharmalovo.backend.model.Order;
import com.pharmalovo.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestParam UUID medicationId,
            @RequestParam int quantity,
            @RequestAttribute("userId") UUID customerId) {

        Order order = orderService.createOrder(customerId, medicationId, quantity);
        return ResponseEntity.ok(order);
    }
}