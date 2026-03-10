package com.pharmalovo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyResponse {
    private UUID id;
    private String name;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String website;
    private String logoUrl;
    private String description;
    private Double latitude;
    private Double longitude;
    private Boolean isOpen;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
