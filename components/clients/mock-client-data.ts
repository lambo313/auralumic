import { ClientStatusSummary, Status } from "@/types";

// Mock client statuses for development
export const mockClientStatuses: ClientStatusSummary[] = [
  {
    id: "67053c9e8f4a2b1d3e5f6789",
    name: "Sarah Johnson",
    avatarUrl: "/assets/clients/sarah.jpg",
    totalStatuses: 12,
    joinDate: new Date("2024-03-15"),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    preferredCategories: ["love", "career", "spiritual"],
    currentStatus: {
      id: "67053ca1b2c3d4e5f6a78901",
      userId: "67053c9e8f4a2b1d3e5f6789",
      content: "I've been feeling really confused about my relationship lately. My partner and I seem to be growing apart and I don't know if we should work through it or if it's time to move on. I keep getting mixed signals and it's affecting my peace of mind.",
      mood: "confused",
      category: "love",
      isActive: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      suggestedReadings: []
    }
  },
  {
    id: "67053ca2c4d5e6f7a8b91234", 
    name: "Michael Chen",
    avatarUrl: "/assets/clients/michael.jpg",
    totalStatuses: 7,
    joinDate: new Date("2024-07-22"),
    lastActive: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    preferredCategories: ["career", "general"],
    currentStatus: {
      id: "67053ca3d6e7f8a9b0c12345",
      userId: "67053ca2c4d5e6f7a8b91234",
      content: "I'm at a crossroads in my career. Got offered a promotion that requires relocating, but I'm not sure if it's the right path for me. The money is good but something feels off. Looking for clarity on what the universe is trying to tell me.",
      mood: "seeking guidance",
      category: "career", 
      isActive: true,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      suggestedReadings: [
        {
          id: "67053ca4e8f9a0b1c2d34567",
          statusId: "67053ca3d6e7f8a9b0c12345",
          readerId: "67053ca5f0a1b2c3d4e56789",
          readerName: "Luna Mystic",
          title: "Career Crossroads Tarot Reading",
          description: "A comprehensive 3-card spread to explore your career path",
          suggestedType: "tarot",
          estimatedDuration: 30,
          suggestedPrice: 45,
          message: "I sense strong energy around this decision. Let me help you navigate this crossroads.",
          isAccepted: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ]
    }
  },
  {
    id: "67053ca61a2b3c4d5e6f7890",
    name: "Emma Rodriguez", 
    avatarUrl: "/assets/clients/emma.jpg",
    totalStatuses: 18,
    joinDate: new Date("2023-11-08"),
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    preferredCategories: ["spiritual", "love"],
    currentStatus: {
      id: "67053ca72c3d4e5f6a789012",
      userId: "67053ca61a2b3c4d5e6f7890", 
      content: "I've been having the same recurring dream for weeks now. It feels so real and meaningful, but I can't decipher what it's trying to tell me. There's a sense of urgency in the dream that I can't shake off during my waking hours.",
      mood: "hopeful",
      category: "spiritual",
      isActive: true,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      suggestedReadings: []
    }
  },
  {
    id: "67053ca83e4f5a6b7c8d9012",
    name: "David Thompson",
    avatarUrl: "/assets/clients/david.jpg", 
    totalStatuses: 5,
    joinDate: new Date("2024-09-01"),
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    preferredCategories: ["general"],
    currentStatus: {
      id: "67053ca94f5a6b7c8d901234",
      userId: "67053ca83e4f5a6b7c8d9012",
      content: "First time here. Been going through a lot of changes lately and feeling lost. Friends recommended getting a reading to gain some perspective on what's happening in my life right now.",
      mood: "seeking guidance",
      category: "general",
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      suggestedReadings: []
    }
  },
  {
    id: "67053caa5a6b7c8d9e0f1234",
    name: "Lisa Park",
    avatarUrl: "/assets/clients/lisa.jpg",
    totalStatuses: 25,
    joinDate: new Date("2023-08-12"),
    lastActive: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago 
    preferredCategories: ["love", "spiritual", "career"],
    currentStatus: {
      id: "67053cab6b7c8d9e0f123456",
      userId: "67053caa5a6b7c8d9e0f1234",
      content: "Amazing synchronicities have been happening all week! I feel like I'm on the right path but want to understand what the universe is preparing me for. The signs are so clear but I want deeper insight.",
      mood: "hopeful", 
      category: "spiritual",
      isActive: false, // This one is closed
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Updated 1 hour ago when accepted
      suggestedReadings: [
        {
          id: "67053cac7c8d9e0f12345678", 
          statusId: "67053cab6b7c8d9e0f123456",
          readerId: "67053cad8d9e0f1234567890", 
          readerName: "Sage Willow",
          title: "Synchronicity & Life Path Reading",
          description: "Explore the meaning behind your synchronicities",
          suggestedType: "astrology",
          estimatedDuration: 45,
          suggestedPrice: 60, 
          message: "Your energy is so bright! I'd love to help you understand these beautiful signs.",
          isAccepted: true,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ],
      acceptedSuggestedReadingId: "67053cac7c8d9e0f12345678"
    }
  },
  {
    id: "67053cae9e0f123456789abc",
    name: "Alex Morgan",
    avatarUrl: "/assets/clients/alex.jpg",
    totalStatuses: 3,
    joinDate: new Date("2024-08-15"), 
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    preferredCategories: ["career", "general"],
    currentStatus: undefined // No current status
  }
];

// Helper function to get mock client by ID
export function getMockClientById(id: string): ClientStatusSummary | undefined {
  return mockClientStatuses.find(client => client.id === id);
}

// Helper function to filter clients
export function filterClients(
  clients: ClientStatusSummary[],
  searchQuery: string,
  selectedCategories: string[],
  statusFilter: 'all' | 'active' | 'no-status'
): ClientStatusSummary[] {
  return clients.filter(client => {
    // Search filter
    const matchesSearch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.currentStatus?.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.currentStatus?.mood?.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter  
    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.some(category => 
        client.preferredCategories?.includes(category) ||
        client.currentStatus?.category === category
      );

    // Status filter
    const matchesStatusFilter = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && client.currentStatus?.isActive) ||
      (statusFilter === 'no-status' && !client.currentStatus);

    return matchesSearch && matchesCategory && matchesStatusFilter;
  });
}