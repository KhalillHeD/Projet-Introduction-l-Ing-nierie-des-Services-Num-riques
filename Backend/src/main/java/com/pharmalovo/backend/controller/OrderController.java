package com.pharmalovo.backend.controller;

import com.pharmalovo.backend.model.Order;
import com.pharmalovo.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    // fetch orders for authenticated customer
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<java.util.List<com.pharmalovo.backend.dto.OrderDTO>> getCustomerOrders(
            @RequestAttribute("userId") UUID customerId) {
        java.util.List<com.pharmalovo.backend.dto.OrderDTO> orders = orderService.getOrdersForCustomer(customerId);
        return ResponseEntity.ok(orders);
    }

    // fetch orders for pharmacy owner
    @GetMapping("/pharmacy")
    @PreAuthorize("hasRole('PHARMACY_OWNER')")
    public ResponseEntity<java.util.List<com.pharmalovo.backend.dto.OrderDTO>> getPharmacyOrders(
            @RequestAttribute("userId") UUID pharmacyId) {
        java.util.List<com.pharmalovo.backend.dto.OrderDTO> orders = orderService.getOrdersForPharmacy(pharmacyId);
        return ResponseEntity.ok(orders);
    }
}