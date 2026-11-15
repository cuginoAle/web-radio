import { act, render, screen } from '@testing-library/react-native';

import { Clock } from '@/components/Clock';

beforeEach(() => jest.useFakeTimers({ now: new Date(2026, 10, 12, 9, 5, 30) }));
afterEach(() => jest.useRealTimers());

describe('Clock', () => {
  // Device locale decides 12h/24h, so only the digits are asserted.
  it('shows hours and minutes and moves on at the minute boundary', async () => {
    await render(<Clock />);
    expect(screen.getByText(/^09:05\b/)).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(29_000));
    expect(screen.getByText(/^09:05\b/)).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(1_000));
    expect(screen.getByText(/^09:06\b/)).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(60_000));
    expect(screen.getByText(/^09:07\b/)).toBeOnTheScreen();
  });
});
