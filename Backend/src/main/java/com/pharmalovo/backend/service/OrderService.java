package com.pharmalovo.backend.service;

import com.pharmalovo.backend.model.*;
import com.pharmalovo.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProfileRepository profileRepository;
    private final PharmacyRepository pharmacyRepository;
    private final MedicationRepository medicationRepository;

    @Transactional
    public Order createOrder(UUID customerId, UUID medicationId, int quantity) {
        // Get customer profile
        Profile customer = profileRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // Get medication
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Medication not found"));

        // Get pharmacy from medication
        Pharmacy pharmacy = medication.getPharmacy();
        if (pharmacy == null) {
            throw new IllegalArgumentException("Medication not associated with a pharmacy");
        }

        // Check stock
        if (medication.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        // Calculate total
        BigDecimal total = medication.getPrice().multiply(BigDecimal.valueOf(quantity));

        // Create order item
        OrderItem orderItem = OrderItem.builder()
                .order(null) // Will be set when added to order
                .medication(medication)
                .quantity(quantity)
                .unitPrice(medication.getPrice())
                .build();

        // Create order
        Order order = Order.builder()
                .customer(customer)
                .pharmacy(pharmacy)
                .items(List.of(orderItem))
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Set order on item
        orderItem.setOrder(order);

        return orderRepository.save(order);
    }

    // ---------- NEW METHODS FOR RETRIEVING ORDERS ----------
    @Transactional(readOnly = true)
    public List<com.pharmalovo.backend.dto.OrderDTO> getOrdersForCustomer(UUID customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<com.pharmalovo.backend.dto.OrderDTO> getOrdersForPharmacy(UUID pharmacyId) {
        return orderRepository.findByPharmacyId(pharmacyId).stream()
                .map(this::toDto)
                .toList();
    }

    private com.pharmalovo.backend.dto.OrderDTO toDto(Order order) {
        // pick first item to represent medication
        String medicationName = null;
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            medicationName = order.getItems().get(0).getMedication().getName();
        }
        return com.pharmalovo.backend.dto.OrderDTO.builder()
                .id(order.getId())
                .medication(medicationName)
                .pharmacy(order.getPharmacy() != null ? order.getPharmacy().getName() : null)
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .date(order.getCreatedAt())
                .price(order.getTotalAmount())
                .build();
    }
}