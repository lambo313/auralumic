import type { Reader } from "@/types/index"

export const mockReaders: Reader[] = [
  {
    id: '64e8b2f8c2a1e2b3d4f5a6c7',
    userId: 'mock-joe-smith',
    username: 'joe_smith',
    profileImage: '/assets/readers/joe-smith.jpg',
    backgroundImage: '/assets/readers/joe-smith-bg.jpg',
    tagline: 'Experienced tarot reader and medium',
    location: 'New York, NY',
    additionalInfo: 'Available for phone and video readings',
    isOnline: true,
    isApproved: true,
    status: 'available',
    languages: ['English', 'Spanish'],
    attributes: {
      tools: ['Tarot Cards', 'Crystal Ball'],
      abilities: ['Tarot', 'Medium', 'Clairvoyant'],
      style: 'Compassionate and direct'
    },
    availability: {
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      timezone: "UTC",
      instantBooking: true
    },
    stats: {
      totalReadings: 342,
      averageRating: 4.8,
      totalEarnings: 5000,
      completionRate: 98.5
    },
    readingOptions: [
      {
        type: 'phone_call',
        name: 'Phone Reading',
        description: 'Traditional phone reading',
        basePrice: 25,
        timeSpans: [
          { duration: 15, label: '15 min', multiplier: 1, isActive: true },
          { duration: 30, label: '30 min', multiplier: 1.8, isActive: true }
        ],
        isActive: true
      }
    ],
    badges: ['Top Rated', 'Verified'],
    reviews: ['Great reading!', 'Very accurate', 'Highly recommend'],
    createdAt: new Date('2023-01-01'),
    lastActive: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01'),
  },
  {
    id: '64e8b2f8c2a1e2b3d4f5a6c8',
    userId: 'mock-emma-thompson',
    username: 'emma_thompson',
    profileImage: '/assets/readers/emma.jpg',
    tagline: 'Experienced tarot reader with over 10 years of practice. Specializing in career guidance and relationship readings.',
    location: 'London, UK',
    additionalInfo: 'Specializes in career and relationship guidance',
    isOnline: true,
    isApproved: true,
    status: 'available',
    languages: ['English', 'Spanish'],
    attributes: {
      tools: ['Tarot Cards', 'Oracle Cards'],
      abilities: ['Tarot', 'Career Guidance', 'Relationships'],
      style: 'Empathetic and insightful'
    },
    availability: {
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      timezone: "UTC",
      instantBooking: true
    },
    stats: {
      totalReadings: 423,
      averageRating: 4.8,
      totalEarnings: 7200,
      completionRate: 97.5
    },
    readingOptions: [
      {
        type: 'video_message',
        name: 'Video Reading',
        description: 'Personalized video message reading',
        basePrice: 30,
        timeSpans: [
          { duration: 15, label: '15 min', multiplier: 1, isActive: true },
          { duration: 30, label: '30 min', multiplier: 1.8, isActive: true }
        ],
        isActive: true
      }
    ],
    badges: ['Career Expert', 'Relationship Specialist'],
    reviews: ['Excellent career advice!', 'Very helpful for relationships', 'Accurate predictions'],
    createdAt: new Date('2022-02-01'),
    lastActive: new Date('2023-05-01'),
    updatedAt: new Date('2023-05-01'),
  },
  {
    id: '64e8b2f8c2a1e2b3d4f5a6c9',
    userId: 'mock-marcus-chen',
    username: 'marcus_chen',
    profileImage: '/assets/readers/marcus.jpg',
    tagline: 'Intuitive psychic medium with a focus on spiritual guidance and past life readings.',
    location: 'San Francisco, CA',
    additionalInfo: 'Specializes in spiritual guidance and past life exploration',
    isOnline: false,
    isApproved: true,
    status: 'busy',
    languages: ['English', 'Mandarin', 'Cantonese'],
    attributes: {
      tools: ['Crystal Ball', 'Pendulum', 'Meditation'],
      abilities: ['Psychic', 'Medium', 'Spiritual Guidance', 'Past Lives'],
      style: 'Gentle and spiritual'
    },
    availability: {
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      timezone: "UTC",
      instantBooking: false
    },
    stats: {
      totalReadings: 567,
      averageRating: 4.9,
      totalEarnings: 12000,
      completionRate: 99.2
    },
    readingOptions: [
      {
        type: 'live_video',
        name: 'Live Video Reading',
        description: 'Real-time spiritual guidance session',
        basePrice: 50,
        timeSpans: [
          { duration: 30, label: '30 min', multiplier: 1, isActive: true },
          { duration: 60, label: '60 min', multiplier: 1.9, isActive: true }
        ],
        isActive: true
      }
    ],
    badges: ['Master Medium', 'Spiritual Guide'],
    reviews: ['Amazing spiritual insights', 'Connected with loved ones', 'Life-changing session'],
    createdAt: new Date('2021-03-01'),
    lastActive: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-01'),
  },
  {
    id: '64e8b2f8c2a1e2b3d4f5a6ca',
    userId: 'mock-sofia-rodriguez',
    username: 'sofia_rodriguez',
    profileImage: '/assets/readers/sofia.jpg',
    tagline: 'Astrologer and numerologist helping clients understand their life path and potential.',
    location: 'Madrid, Spain',
    additionalInfo: 'Expert in life path analysis and cosmic guidance',
    isOnline: true,
    isApproved: true,
    status: 'available',
    languages: ['English', 'Spanish', 'Portuguese'],
    attributes: {
      tools: ['Birth Charts', 'Numerology Charts', 'Tarot Cards'],
      abilities: ['Astrology', 'Numerology', 'Life Path'],
      style: 'Analytical and enlightening'
    },
    availability: {
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      timezone: "UTC",
      instantBooking: true
    },
    stats: {
      totalReadings: 245,
      averageRating: 4.7,
      totalEarnings: 4200,
      completionRate: 96.8
    },
    readingOptions: [
      {
        type: 'video_message',
        name: 'Astrology Reading',
        description: 'Detailed astrological analysis',
        basePrice: 35,
        timeSpans: [
          { duration: 20, label: '20 min', multiplier: 1, isActive: true },
          { duration: 40, label: '40 min', multiplier: 1.7, isActive: true }
        ],
        isActive: true
      }
    ],
    badges: ['Astrology Expert', 'Numerology Specialist'],
    reviews: ['Incredible birth chart reading', 'Accurate life path guidance', 'Very detailed analysis'],
    createdAt: new Date('2020-04-01'),
    lastActive: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-01'),
  },
  {
    id: '64e8b2f8c2a1e2b3d4f5a6cb',
    userId: 'mock-david-walker',
    username: 'david_walker',
    profileImage: '/assets/readers/david.jpg',
    tagline: 'Energy healer and chakra specialist with certification in Reiki and crystal healing.',
    location: 'Austin, TX',
    additionalInfo: 'Certified Reiki master and crystal healing specialist',
    isOnline: false,
    isApproved: true,
    status: 'offline',
    languages: ['English'],
    attributes: {
      tools: ['Crystals', 'Reiki', 'Chakra Stones'],
      abilities: ['Energy Healing', 'Chakra', 'Crystal Reading'],
      style: 'Calming and healing-focused'
    },
    availability: {
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      timezone: "UTC",
      instantBooking: false
    },
    stats: {
      totalReadings: 189,
      averageRating: 4.6,
      totalEarnings: 3200,
      completionRate: 95.5
    },
    readingOptions: [
      {
        type: 'phone_call',
        name: 'Energy Healing Session',
        description: 'Chakra balancing and energy work',
        basePrice: 40,
        timeSpans: [
          { duration: 30, label: '30 min', multiplier: 1, isActive: true },
          { duration: 60, label: '60 min', multiplier: 1.8, isActive: true }
        ],
        isActive: true
      }
    ],
    badges: ['Reiki Master', 'Energy Healer'],
    reviews: ['Incredible healing session', 'Felt so balanced after', 'Amazing energy work'],
    createdAt: new Date('2019-05-01'),
    lastActive: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01'),
  },
  {
    id: '64e8b2f8c2a1e2b3d4f5a6cc',
    userId: 'mock-aisha-patel',
    username: 'aisha_patel',
    profileImage: '/assets/readers/aisha.jpg',
    tagline: 'Vedic astrologer and palm reader with deep knowledge of ancient practices.',
    location: 'Mumbai, India',
    additionalInfo: 'Expert in ancient Vedic practices and palm reading traditions',
    isOnline: true,
    isApproved: true,
    status: 'available',
    languages: ['English', 'Hindi', 'Gujarati'],
    attributes: {
      tools: ['Vedic Charts', 'Palm Reading', 'Ancient Texts'],
      abilities: ['Vedic Astrology', 'Palm Reading', 'Hindu Astrology'],
      style: 'Traditional and wise'
    },
    availability: {
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      timezone: "UTC",
      instantBooking: true
    },
    stats: {
      totalReadings: 389,
      averageRating: 4.9,
      totalEarnings: 8500,
      completionRate: 99.5
    },
    readingOptions: [
      {
        type: 'live_video',
        name: 'Vedic Astrology Reading',
        description: 'Traditional Vedic astrological consultation',
        basePrice: 45,
        timeSpans: [
          { duration: 30, label: '30 min', multiplier: 1, isActive: true },
          { duration: 60, label: '60 min', multiplier: 1.9, isActive: true }
        ],
        isActive: true
      }
    ],
    badges: ['Vedic Master', 'Traditional Astrologer'],
    reviews: ['Incredible Vedic insights', 'Amazing palm reading accuracy', 'Deep spiritual wisdom'],
    createdAt: new Date('2018-06-01'),
    lastActive: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];
// Helper to get a mock reader by id or userId
export function getMockReaderById(id: string): Reader | undefined {
  return mockReaders.find(reader => reader.id === id || reader.userId === id);
}

export const specialtiesList = Array.from(
  new Set(mockReaders.flatMap((reader) => reader.attributes.abilities))
).sort()

export const languagesList = Array.from(
  new Set(mockReaders.flatMap((reader) => reader.languages))
).sort()
