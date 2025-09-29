import { ReadingRequest } from '@/types/readings';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  specialties?: string[];
  availability?: Array<{
    day: number;
    startTime: string;
    endTime: string;
    timezone: string;
  }>;
}

// User related API calls
export const userService = {
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      credentials: 'include',
    });
    return response.json();
  },

  async updateProfile(data: ProfileUpdateData) {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return response.json();
  },
};

// Reader related API calls
export const readerService = {
  async getReaders(params?: { page?: number; limit?: number; query?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.query) searchParams.append('query', params.query);

    const response = await fetch(`${API_BASE_URL}/api/readers?${searchParams}`);
    return response.json();
  },

  async getReaderById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/readers/${id}`);
    return response.json();
  },

  async getPendingApprovals() {
    const response = await fetch(`${API_BASE_URL}/api/admin/readers/pending`, {
      credentials: 'include',
    });
    return response.json();
  },

  async approve(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/readers/${id}/approve`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },

  async reject(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/readers/${id}/reject`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },

  async submitApplication(data: {
    username: string;
    profileImage: string;
    tagline: string;
    location: string;
    specialties: string;
    experience: string;
    availability: string;
    additionalInfo?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/readers/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        profileImage: data.profileImage,
        tagline: data.tagline,
        location: data.location,
        type: 'general', // default type
        bio: data.experience,
        attributes: data.specialties.split(',').map(s => s.trim()),
        availability: data.availability,
        additionalInfo: data.additionalInfo
      }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to submit reader application');
    }
    return response.json();
  },
};

// Reading related API calls
export const readingService = {
  async createReading(data: ReadingRequest) {
    const response = await fetch(`${API_BASE_URL}/api/readings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return response.json();
  },

  async getReadings(params?: { status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/readings?${searchParams}`, {
      credentials: 'include',
    });
    return response.json();
  },

  async getReadingById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/readings/${id}`, {
      credentials: 'include',
    });
    return response.json();
  },
};

// Notification related API calls
export const notificationService = {
  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      credentials: 'include',
    });
    return response.json();
  },

  async markAsRead(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/mark-read`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },

  async markAllAsRead() {
    const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },
};

// Credit related API calls
export const creditService = {
  async getBalance() {
    const response = await fetch(`${API_BASE_URL}/api/credits/balance`, {
      credentials: 'include',
    });
    return response.json();
  },

  async purchaseCredits(packageId: string) {
    const response = await fetch(`${API_BASE_URL}/api/credits/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageId }),
      credentials: 'include',
    });
    return response.json();
  },
};

// Admin related API calls
export const adminService = {
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      credentials: 'include',
    });
    return response.json();
  },
  
  async getDisputes() {
    const response = await fetch(`${API_BASE_URL}/api/admin/disputes`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    return response.json();
  },

  async resolveDispute(disputeId: string, resolution: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/disputes/${disputeId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resolution }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    return response.json();
  },

  // User management
  async getUsers(filters?: { role?: string; status?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE_URL}/api/admin/users?${queryParams}`, {
      credentials: 'include',
    });
    return response.json();
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
      credentials: 'include',
    });
    return response.json();
  },

  async updateUserRole(userId: string, role: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
      credentials: 'include',
    });
    return response.json();
  },

  // Reader management
  async getReaders(filters?: { status?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE_URL}/api/admin/readers?${queryParams}`, {
      credentials: 'include',
    });
    return response.json();
  },

  async approveReader(readerId: string, approved: boolean, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/readers/${readerId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approved, notes }),
      credentials: 'include',
    });
    return response.json();
  },

  // Content management
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
      credentials: 'include',
    });
    return response.json();
  },

  async createCategory(category: { name: string; description: string; isActive: boolean }) {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
      credentials: 'include',
    });
    return response.json();
  },

  async updateCategory(categoryId: string, category: { name: string; description: string; isActive: boolean }) {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
      credentials: 'include',
    });
    return response.json();
  },

  async deleteCategory(categoryId: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },

  async getAttributes() {
    const response = await fetch(`${API_BASE_URL}/api/admin/attributes`, {
      credentials: 'include',
    });
    return response.json();
  },

  async createAttribute(type: string, attribute: { name: string; description: string }) {
    const response = await fetch(`${API_BASE_URL}/api/admin/attributes/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attribute),
      credentials: 'include',
    });
    return response.json();
  },

  async updateAttribute(type: string, attributeId: string, attribute: { name: string; description: string }) {
    const response = await fetch(`${API_BASE_URL}/api/admin/attributes/${type}/${attributeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attribute),
      credentials: 'include',
    });
    return response.json();
  },

  async deleteAttribute(type: string, attributeId: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/attributes/${type}/${attributeId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },

  async getBadges() {
    const response = await fetch(`${API_BASE_URL}/api/admin/badges`, {
      credentials: 'include',
    });
    return response.json();
  },

  async createBadge(badge: any) {
    const response = await fetch(`${API_BASE_URL}/api/admin/badges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badge),
      credentials: 'include',
    });
    return response.json();
  },

  async updateBadge(badgeId: string, badge: any) {
    const response = await fetch(`${API_BASE_URL}/api/admin/badges/${badgeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badge),
      credentials: 'include',
    });
    return response.json();
  },

  async deleteBadge(badgeId: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/badges/${badgeId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },
};

// Export unified API object
export const api = {
  users: userService,
  readers: readerService,
  readings: readingService,
  notifications: notificationService,
  credits: creditService,
  admin: adminService,
};
