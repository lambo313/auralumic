import { vi } from 'vitest';

const mockStripe = {
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}));

export { mockStripe };
