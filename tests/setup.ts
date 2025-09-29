import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: vi.fn(() => null),
}));

// Global fetch mock
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});
