import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('identity onboarding flow (real, executed run)', () => {
  it('lets a person type their own name, pick an avatar, and see it reflected in Your Sky', async () => {
    const user = userEvent.setup();

    // Onboarding is now an optional, explicit flow reached via its own
    // URL rather than the app's default landing route (which opens
    // straight into the Galaxy — see App.tsx). Navigate there directly,
    // the way a "Create your Sky" link would.
    window.history.pushState({}, '', '/onboarding');
    render(<App />);

    // Should land on the Welcome screen and route through to Identity.
    const enterButton = await screen.findByText(/enter the sky/i);
    await user.click(enterButton);

    // Identity screen: type a real custom name.
    const nameInput = await screen.findByLabelText(/display name/i);
    await user.type(nameInput, 'Rohan Test');

    // Pick a non-default avatar.
    const unicornAvatar = await screen.findByLabelText(/choose avatar 🦄/i);
    await user.click(unicornAvatar);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    // Interests screen: pick 3 interests to satisfy the guard.
    const interestButtons = await screen.findAllByRole('button', { name: /music|art|startups|tech|climate|mental-health|gaming|books|fitness/i });
    for (const btn of interestButtons.slice(0, 3)) {
      await user.click(btn);
    }
    const continueToGalaxy = screen.getByRole('button', { name: /enter the galaxy/i });
    await user.click(continueToGalaxy);

    // Confirm the app actually landed in the galaxy with the identity applied
    // (the route guard would have bounced back to onboarding if hasSetIdentity
    // or interests were not actually recorded correctly).
    await waitFor(() => {
      expect(window.location.pathname).toBe('/galaxy');
    });

    // Navigate to Your Sky the same way a real person would: clicking their
    // own avatar in the top bar. Staying in the same mounted app instance
    // (not remounting) is what actually proves the typed name persists
    // through the session, not just at the moment of entry.
    const yourAvatarButton = await screen.findByRole('button', { name: /your sky/i });
    await user.click(yourAvatarButton);

    expect(await screen.findByText('Rohan Test')).toBeInTheDocument();
  });
});
