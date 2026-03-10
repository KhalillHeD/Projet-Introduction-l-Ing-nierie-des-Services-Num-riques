package com.pharmalovo.backend.controller;

import com.pharmalovo.backend.dto.PharmacyRequest;
import com.pharmalovo.backend.dto.PharmacyResponse;
import com.pharmalovo.backend.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pharmacies")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping
    public ResponseEntity<List<PharmacyResponse>> getAllPharmacies() {
        return ResponseEntity.ok(pharmacyService.getAllPharmacies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PharmacyResponse> getPharmacyById(@PathVariable UUID id) {
        return ResponseEntity.ok(pharmacyService.getPharmacyById(id));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<PharmacyResponse>> getPharmaciesByCity(@PathVariable String city) {
        return ResponseEntity.ok(pharmacyService.getPharmaciesByCity(city));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PharmacyResponse>> searchPharmacies(@RequestParam String name) {
        return ResponseEntity.ok(pharmacyService.searchPharmaciesByName(name));
    }

    @PostMapping
    public ResponseEntity<PharmacyResponse> createPharmacy(
            @RequestBody PharmacyRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        PharmacyResponse response = pharmacyService.createPharmacy(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PharmacyResponse> updatePharmacy(
            @PathVariable UUID id,
            @RequestBody PharmacyRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(pharmacyService.updatePharmacy(id, request, username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePharmacy(
            @PathVariable UUID id,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        pharmacyService.deletePharmacy(id, username);
        return ResponseEntity.noContent().build();
    }
}
