import { Reading } from "@/types"

class ReadingService {
  private baseUrl = "/api/readings"

  async getReadings(params?: {
    status?: Reading["status"]
    page?: number
    limit?: number
  }): Promise<Reading[]> {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : ""

    const response = await fetch(`${this.baseUrl}${queryString}`)
    if (!response.ok) {
      throw new Error("Failed to fetch readings")
    }

    return response.json()
  }

  async getReadingById(id: string): Promise<Reading> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch reading")
    }

    return response.json()
  }

  async createReadingRequest(data: {
    readerId: string
    topic: string
    description: string
    duration: number
  }): Promise<Reading> {
    const response = await fetch(`${this.baseUrl}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create reading request")
    }

    return response.json()
  }

  async acceptReading(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/accept`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to accept reading")
    }
  }

  async declineReading(id: string, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/decline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      throw new Error("Failed to decline reading")
    }
  }

  async completeReading(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/complete`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to complete reading")
    }
  }

  async submitReview(id: string, data: {
    rating: number
    review?: string
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to submit review")
    }
  }
}

export const readingService = new ReadingService()
