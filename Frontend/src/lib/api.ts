const API_BASE_URL = "http://localhost:8080/api";

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  isOpen: boolean;
  is24Hours?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PharmacyRequest {
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  isOpen?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  requiresPrescription: boolean;
  description?: string;
  manufacturer?: string;
  expiryDate?: string;
  pharmacyId?: string;
}

export const pharmacyAPI = {
  // Get all pharmacies
  getAll: async (): Promise<Pharmacy[]> => {
    const response = await fetch(`${API_BASE_URL}/pharmacies`);
    if (!response.ok) {
      throw new Error("Failed to fetch pharmacies");
    }
    return response.json();
  },

  // Get pharmacy by ID
  getById: async (id: string): Promise<Pharmacy> => {
    const response = await fetch(`${API_BASE_URL}/pharmacies/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch pharmacy");
    }
    return response.json();
  },

  // Get pharmacies by city
  getByCity: async (city: string): Promise<Pharmacy[]> => {
    const response = await fetch(`${API_BASE_URL}/pharmacies/city/${city}`);
    if (!response.ok) {
      throw new Error("Failed to fetch pharmacies by city");
    }
    return response.json();
  },

  // Search pharmacies by name
  search: async (name: string): Promise<Pharmacy[]> => {
    const response = await fetch(
      `${API_BASE_URL}/pharmacies/search?name=${encodeURIComponent(name)}`,
    );
    if (!response.ok) {
      throw new Error("Failed to search pharmacies");
    }
    return response.json();
  },

  // Create a new pharmacy (requires authentication)
  create: async (
    pharmacy: PharmacyRequest,
    token?: string,
  ): Promise<Pharmacy> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/pharmacies`, {
      method: "POST",
      headers,
      body: JSON.stringify(pharmacy),
    });

    if (!response.ok) {
      throw new Error("Failed to create pharmacy");
    }
    return response.json();
  },

  // Update a pharmacy (requires authentication)
  update: async (
    id: string,
    pharmacy: PharmacyRequest,
    token?: string,
  ): Promise<Pharmacy> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/pharmacies/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(pharmacy),
    });

    if (!response.ok) {
      throw new Error("Failed to update pharmacy");
    }
    return response.json();
  },

  // Delete a pharmacy (requires authentication)
  delete: async (id: string, token?: string): Promise<void> => {
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/pharmacies/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to delete pharmacy");
    }
  },
};

export const medicationAPI = {
  // Get all medications for a pharmacy
  getByPharmacy: async (pharmacyId: string): Promise<Medication[]> => {
    const response = await fetch(
      `${API_BASE_URL}/pharmacies/${pharmacyId}/medications`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch medications");
    }
    return response.json();
  },

  // Get all medications
  getAll: async (): Promise<Medication[]> => {
    const response = await fetch(`${API_BASE_URL}/medications`);
    if (!response.ok) {
      throw new Error("Failed to fetch medications");
    }
    return response.json();
  },

  // Search medications
  search: async (query: string): Promise<Medication[]> => {
    const response = await fetch(
      `${API_BASE_URL}/medications/search?q=${encodeURIComponent(query)}`,
    );
    if (!response.ok) {
      throw new Error("Failed to search medications");
    }
    return response.json();
  },
};
