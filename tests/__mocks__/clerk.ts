import { vi } from 'vitest';

const mockAuth = {
  currentUser: vi.fn(),
  isSignedIn: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
};

vi.mock('@clerk/nextjs', () => ({
  auth: () => mockAuth,
  clerkClient: {
    users: {
      getUser: vi.fn(),
      updateUser: vi.fn(),
    },
  },
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{
        emailAddress: 'test@example.com',
      }],
    },
  }),
}));

export { mockAuth };
