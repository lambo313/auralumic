import { Reader } from "@/types"

class ReaderService {
  private baseUrl = "/api/readers"

  async getReaders(params?: {
    type?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<Reader[]> {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : ""

    const response = await fetch(`${this.baseUrl}${queryString}`)
    if (!response.ok) {
      throw new Error("Failed to fetch readers")
    }

    return response.json()
  }

  async getReaderById(id: string): Promise<Reader> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch reader")
    }

    return response.json()
  }

  async updateReaderProfile(id: string, data: Partial<Reader>): Promise<Reader> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update reader profile")
    }

    return response.json()
  }

  async updateReaderStatus(id: string, status: Reader["status"]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error("Failed to update reader status")
    }
  }

  async getReaderStats(id: string): Promise<{
    totalReadings: number
    averageRating: number
    completionRate: number
  }> {
    const response = await fetch(`${this.baseUrl}/${id}/stats`)
    if (!response.ok) {
      throw new Error("Failed to fetch reader stats")
    }

    return response.json()
  }

  async searchReaders(query: string): Promise<Reader[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error("Failed to search readers")
    }

    return response.json()
  }

  async applyAsReader(data: {
    username: string
    profileImage: string
    tagline: string
    location: string
    bio: string
    attributes: string[]
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to submit reader application")
    }
  }
}

export const readerService = new ReaderService()
