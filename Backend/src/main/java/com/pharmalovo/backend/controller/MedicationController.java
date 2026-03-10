package com.pharmalovo.backend.controller;

import com.pharmalovo.backend.model.Medication;
import com.pharmalovo.backend.service.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicationController {
    private final MedicationService medicationService;

    @GetMapping
    public ResponseEntity<List<Medication>> getAllMedications(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) UUID pharmacyId) {
        
        if (name != null) {
            return ResponseEntity.ok(medicationService.searchMedications(name));
        } else if (category != null) {
            return ResponseEntity.ok(medicationService.getMedicationsByCategory(category));
        } else if (pharmacyId != null) {
            return ResponseEntity.ok(medicationService.getMedicationsByPharmacy(pharmacyId));
        }
        return ResponseEntity.ok(medicationService.getAllMedications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medication> getMedicationById(@PathVariable UUID id) {
        return ResponseEntity.ok(medicationService.getMedicationById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('PHARMACY_OWNER')")
    public ResponseEntity<Medication> createMedication(@RequestBody Medication medication) {
        return ResponseEntity.ok(medicationService.createMedication(medication));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medication> updateMedication(@PathVariable UUID id, @RequestBody Medication medication) {
        return ResponseEntity.ok(medicationService.updateMedication(id, medication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(@PathVariable UUID id) {
        medicationService.deleteMedication(id);
        return ResponseEntity.noContent().build();
    }
}
