package com.pharmalovo.backend.service;

import com.pharmalovo.backend.dto.PharmacyRequest;
import com.pharmalovo.backend.dto.PharmacyResponse;
import com.pharmalovo.backend.model.Pharmacy;
import com.pharmalovo.backend.model.Profile;
import com.pharmalovo.backend.repository.PharmacyRepository;
import com.pharmalovo.backend.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final ProfileRepository profileRepository;

    public List<PharmacyResponse> getAllPharmacies() {
        return pharmacyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PharmacyResponse getPharmacyById(UUID id) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found with id: " + id));
        return mapToResponse(pharmacy);
    }

    public List<PharmacyResponse> getPharmaciesByCity(String city) {
        return pharmacyRepository.findByCityIgnoreCase(city).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PharmacyResponse> searchPharmaciesByName(String name) {
        return pharmacyRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PharmacyResponse createPharmacy(PharmacyRequest request, String username) {
        // For now, create pharmacy without owner requirement
        // In production, you would fetch the user's profile here
        Pharmacy pharmacy = Pharmacy.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .phone(request.getPhone())
                .email(request.getEmail())
                .website(request.getWebsite())
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isOpen(request.getIsOpen() != null ? request.getIsOpen() : true)
                .build();

        Pharmacy savedPharmacy = pharmacyRepository.save(pharmacy);
        return mapToResponse(savedPharmacy);
    }

    @Transactional
    public PharmacyResponse updatePharmacy(UUID id, PharmacyRequest request, String username) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found with id: " + id));

        // Skip ownership verification for now
        pharmacy.setName(request.getName());
        pharmacy.setAddress(request.getAddress());
        pharmacy.setCity(request.getCity());
        pharmacy.setPhone(request.getPhone());
        pharmacy.setEmail(request.getEmail());
        pharmacy.setWebsite(request.getWebsite());
        pharmacy.setLogoUrl(request.getLogoUrl());
        pharmacy.setDescription(request.getDescription());
        pharmacy.setLatitude(request.getLatitude());
        pharmacy.setLongitude(request.getLongitude());
        pharmacy.setIsOpen(request.getIsOpen());

        Pharmacy updatedPharmacy = pharmacyRepository.save(pharmacy);
        return mapToResponse(updatedPharmacy);
    }

    @Transactional
    public void deletePharmacy(UUID id, String username) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found with id: " + id));

        // Skip ownership verification for now
        pharmacyRepository.delete(pharmacy);
    }

    private PharmacyResponse mapToResponse(Pharmacy pharmacy) {
        return PharmacyResponse.builder()
                .id(pharmacy.getId())
                .name(pharmacy.getName())
                .address(pharmacy.getAddress())
                .city(pharmacy.getCity())
                .phone(pharmacy.getPhone())
                .email(pharmacy.getEmail())
                .website(pharmacy.getWebsite())
                .logoUrl(pharmacy.getLogoUrl())
                .description(pharmacy.getDescription())
                .latitude(pharmacy.getLatitude())
                .longitude(pharmacy.getLongitude())
                .isOpen(pharmacy.getIsOpen())
                .createdAt(pharmacy.getCreatedAt())
                .updatedAt(pharmacy.getUpdatedAt())
                .build();
    }
}
