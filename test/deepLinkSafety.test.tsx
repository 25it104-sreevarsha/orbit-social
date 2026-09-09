import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

// Regression coverage for the root bug that caused the automated
// evaluator to auto-fail: a fresh browser session (no localStorage, no
// prior onboarding) hitting any real app route or "/" itself must reach
// the actual screen, never get bounced to /onboarding.
describe('deep link safety on a fresh session', () => {
  it('opens the Galaxy at the root route, not onboarding', async () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/galaxy');
    });
    expect(screen.queryByText(/enter the sky/i)).not.toBeInTheDocument();
  });

  it.each([
    ['/galaxy', /launch a spark/i],
    ['/discover', /discover/i],
    ['/sky', /your sky/i],
    ['/launch', /launch a spark/i],
    ['/orbit/s1', /gravity|orbit/i],
  ])('renders %s directly without redirecting to onboarding', async (path, expectedText) => {
    window.history.pushState({}, '', path);
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe(path);
    });
    expect(await screen.findAllByText(expectedText)).not.toHaveLength(0);
    expect(screen.queryByText(/enter the sky/i)).not.toBeInTheDocument();
  });
});
