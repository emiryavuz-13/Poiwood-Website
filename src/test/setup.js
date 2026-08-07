import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  storage: {},
}));

beforeEach(() => {
  localStorage.clear();
});
