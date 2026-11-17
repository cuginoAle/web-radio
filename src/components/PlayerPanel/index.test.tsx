import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { MiniPlayer } from '@/components/MiniPlayer';
import { PlayerPanel } from '@/components/PlayerPanel';
import { getStation } from '@/db/queries/stations';
import { listFavoriteUuids } from '@/db/queries/favorites';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { router } from '@test/fakes/fakeRouter';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { startTestApp } from '@test/ui/startTestApp';

jest.mock('expo-router', () => jest.requireActual('@test/fakes/fakeRouter'));

// The spectrum is decoration: hidden from screen readers, so from the default queries too.
const hidden = { includeHiddenElements: true };
const catalog = ['a', 'b'].map((uuid) => rawStation({ stationuuid: uuid, name: `Radio ${uuid}`, tags: 'jazz' }));

async function listening(index = 0) {
  const app = await startTestApp(catalog);
  const uuid = ['a', 'b'][index];
  const station = toSnapshot((await getStation(app.db, uuid))!);
  await act(async () => app.audio.play(station, { uuids: ['a', 'b'], index }));
  return app;
}

describe('PlayerPanel', () => {
  it('invites to choose a radio when nothing is selected', async () => {
    await startTestApp(catalog);
    await render(<PlayerPanel />);
    expect(screen.getByText('Choose a station to start listening')).toBeOnTheScreen();
  });

  it('while loading shows the station, without claiming it is playing', async () => {
    await listening();
    await render(<PlayerPanel />);
    expect(screen.getByText('Radio a')).toBeOnTheScreen();
    expect(screen.getByText('Loading…')).toBeOnTheScreen();
    expect(screen.queryByText('LIVE')).toBeNull();
  });

  it('when playing shows LIVE and no invented track info, and can pause', async () => {
    const { player, state } = await listening();
    await render(<PlayerPanel />);
    await act(async () => player.emitPlaying());

    expect(screen.getByText('LIVE')).toBeOnTheScreen();
    expect(screen.getByText('Live radio')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    expect(state().player.status).toBe('paused');
    expect(screen.getByRole('button', { name: 'Resume' })).toBeOnTheScreen();
  });

  it('on error explains and offers a manual retry', async () => {
    const { player, state } = await listening();
    await render(<PlayerPanel />);
    await act(async () => player.emitError());

    expect(screen.getByText(/Unable to play/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(state().player.status).toBe('loading');
  });

  it('disables previous and next at the limits of the list', async () => {
    await listening(0);
    await render(<PlayerPanel />);
    expect(screen.getByRole('button', { name: 'Previous station' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next station' })).toBeEnabled();
  });

  it('next moves to the following station of the list', async () => {
    const { state } = await listening(0);
    await render(<PlayerPanel />);
    await fireEvent.press(screen.getByRole('button', { name: 'Next station' }));
    await waitFor(() => expect(state().player.station?.uuid).toBe('b'));
  });

  it('the heart saves the station being listened to', async () => {
    const { db } = await listening();
    await render(<PlayerPanel />);
    await fireEvent.press(screen.getByRole('button', { name: 'Add to favourites' }));
    await waitFor(async () => expect(await listFavoriteUuids(db)).toEqual(['a']));
  });
});

describe('PlayerPanel as side panel (landscape)', () => {
  it('shows only artwork, title and heart: no status, no song (it sits on the bottom line), no previous/next', async () => {
    const { player } = await listening();
    await render(<PlayerPanel side />);
    await act(async () => {
      player.emitPlaying();
      player.emitTitle('Miles Davis - So What');
    });

    expect(screen.getByText('Radio a')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Add to favourites' })).toBeOnTheScreen();
    expect(screen.queryByText('Miles Davis - So What')).toBeNull();
    expect(screen.queryByText('LIVE')).toBeNull();
    expect(screen.queryByText('Live radio')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Previous station' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next station' })).toBeNull();
  });

  it('the artwork pauses and resumes, showing bars or a triangle', async () => {
    const { player, state } = await listening();
    await render(<PlayerPanel side />);
    await act(async () => player.emitPlaying());
    expect(screen.getByTestId('glyph-pause')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    expect(state().player.status).toBe('paused');
    expect(screen.getByTestId('glyph-play')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Resume' }));
    expect(state().player.status).toBe('loading');
    expect(screen.getByTestId('glyph-loading')).toBeOnTheScreen();
  });

  it('on error shows the message and an exclamation mark; the artwork retries', async () => {
    const { player, state } = await listening();
    await render(<PlayerPanel side />);
    await act(async () => player.emitError());

    expect(screen.getByText(/Unable to play/)).toBeOnTheScreen();
    expect(screen.queryByText('Retry')).toBeNull();
    expect(screen.getByTestId('glyph-error')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(state().player.status).toBe('loading');
  });

  it('bars and triangle fade out after 3 s; spinner and exclamation mark stay', async () => {
    const { player } = await listening();
    await render(<PlayerPanel side />);
    jest.useFakeTimers();
    try {
      await act(async () => jest.advanceTimersByTime(5000));
      expect(screen.getByTestId('glyph-loading')).toBeOnTheScreen();

      await act(async () => player.emitError());
      await act(async () => jest.advanceTimersByTime(5000));
      expect(screen.getByTestId('glyph-error')).toBeOnTheScreen();

      await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
      await act(async () => player.emitPlaying());
      await act(async () => jest.advanceTimersByTime(2900));
      expect(screen.getByTestId('glyph-pause')).toBeOnTheScreen();
      await act(async () => jest.advanceTimersByTime(600));
      expect(screen.queryByTestId('glyph-pause')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('MiniPlayer', () => {
  it('is absent when nothing is selected', async () => {
    await startTestApp(catalog);
    await render(<MiniPlayer />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('opens the full player and controls playback', async () => {
    const { player, state } = await listening();
    await render(<MiniPlayer />);
    await act(async () => player.emitPlaying());

    await fireEvent.press(screen.getByRole('button', { name: 'Open player: Radio a' }));
    expect(router.push).toHaveBeenCalledWith('/player');

    await fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    expect(state().player.status).toBe('paused');
  });

  it('shows the spectrum behind the card only while playing, and measures it only then', async () => {
    const { player, audio } = await listening();
    await render(<MiniPlayer />);
    expect(screen.queryByTestId('spectrum', hidden)).toBeNull();
    expect(player.spectrumEnabled).toBe(false);

    await act(async () => player.emitPlaying());
    expect(screen.getByTestId('spectrum', hidden)).toBeOnTheScreen();
    expect(player.spectrumEnabled).toBe(true);

    await act(async () => audio.pause());
    expect(screen.queryByTestId('spectrum', hidden)).toBeNull();
    expect(player.spectrumEnabled).toBe(false);
  });

  it('stops measuring the spectrum while the app is in the background', async () => {
    const { player } = await listening();
    await render(<MiniPlayer />);
    await act(async () => player.emitPlaying());
    expect(player.spectrumEnabled).toBe(true);

    const appStateChanged = jest.mocked(AppState.addEventListener).mock.lastCall![1];
    await act(async () => appStateChanged('background'));
    expect(player.spectrumEnabled).toBe(false);

    await act(async () => appStateChanged('active'));
    expect(player.spectrumEnabled).toBe(true);
  });

  it('draws no spectrum when the system asks for no animations', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const { player } = await listening();
    await render(<MiniPlayer />);
    await act(async () => player.emitPlaying());

    expect(screen.queryByTestId('spectrum', hidden)).toBeNull();
    expect(player.spectrumEnabled).toBe(false);
    jest.mocked(useReducedMotion).mockReturnValue(false);
  });
});

describe.each([
  ['phone full player', <PlayerPanel key="full" />],
  ['landscape side panel', <PlayerPanel key="side" side />],
])('Spectrum in the %s', (_name, panel) => {
  it('is drawn along the bottom while playing and gone when paused', async () => {
    const { player, audio } = await listening();
    await render(panel);
    expect(screen.queryByTestId('spectrum', hidden)).toBeNull();

    await act(async () => player.emitPlaying());
    expect(screen.getByTestId('spectrum', hidden)).toBeOnTheScreen();

    await act(async () => audio.pause());
    expect(screen.queryByTestId('spectrum', hidden)).toBeNull();
  });
});
