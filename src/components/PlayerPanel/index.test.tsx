import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { MiniPlayer } from '@/components/MiniPlayer';
import { PlayerPanel } from '@/components/PlayerPanel';
import { getStation } from '@/db/queries/stations';
import { listFavoriteUuids } from '@/db/queries/favorites';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { router } from '@test/fakes/fakeRouter';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { startTestApp } from '@test/ui/startTestApp';

jest.mock('expo-router', () => jest.requireActual('@test/fakes/fakeRouter'));

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
    expect(screen.getByText('Scegli una radio per iniziare l’ascolto')).toBeOnTheScreen();
  });

  it('while loading shows the station, without claiming it is playing', async () => {
    await listening();
    await render(<PlayerPanel />);
    expect(screen.getByText('Radio a')).toBeOnTheScreen();
    expect(screen.getByText('Caricamento…')).toBeOnTheScreen();
    expect(screen.queryByText('LIVE')).toBeNull();
  });

  it('when playing shows LIVE and no invented track info, and can pause', async () => {
    const { player, state } = await listening();
    await render(<PlayerPanel />);
    await act(async () => player.emitPlaying());

    expect(screen.getByText('LIVE')).toBeOnTheScreen();
    expect(screen.getByText('Radio in diretta')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Metti in pausa' }));
    expect(state().player.status).toBe('paused');
    expect(screen.getByRole('button', { name: 'Riprendi' })).toBeOnTheScreen();
  });

  it('on error explains and offers a manual retry', async () => {
    const { player, state } = await listening();
    await render(<PlayerPanel />);
    await act(async () => player.emitError());

    expect(screen.getByText(/Impossibile riprodurre/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Riprova' }));
    expect(state().player.status).toBe('loading');
  });

  it('disables previous and next at the limits of the list', async () => {
    await listening(0);
    await render(<PlayerPanel />);
    expect(screen.getByRole('button', { name: 'Radio precedente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Radio successiva' })).toBeEnabled();
  });

  it('next moves to the following station of the list', async () => {
    const { state } = await listening(0);
    await render(<PlayerPanel />);
    await fireEvent.press(screen.getByRole('button', { name: 'Radio successiva' }));
    await waitFor(() => expect(state().player.station?.uuid).toBe('b'));
  });

  it('the heart saves the station being listened to', async () => {
    const { db } = await listening();
    await render(<PlayerPanel />);
    await fireEvent.press(screen.getByRole('button', { name: 'Aggiungi ai preferiti' }));
    await waitFor(async () => expect(await listFavoriteUuids(db)).toEqual(['a']));
  });
});

describe('PlayerPanel as side panel (landscape)', () => {
  it('shows only artwork, title and heart: no status, no previous/next', async () => {
    const { player } = await listening();
    await render(<PlayerPanel side />);
    await act(async () => player.emitPlaying());

    expect(screen.getByText('Radio a')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Aggiungi ai preferiti' })).toBeOnTheScreen();
    expect(screen.queryByText('LIVE')).toBeNull();
    expect(screen.queryByText('Radio in diretta')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Radio precedente' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Radio successiva' })).toBeNull();
  });

  it('the artwork pauses and resumes, showing bars or a triangle', async () => {
    const { player, state } = await listening();
    await render(<PlayerPanel side />);
    await act(async () => player.emitPlaying());
    expect(screen.getByTestId('glyph-pause')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Metti in pausa' }));
    expect(state().player.status).toBe('paused');
    expect(screen.getByTestId('glyph-play')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Riprendi' }));
    expect(state().player.status).toBe('loading');
    expect(screen.getByTestId('glyph-loading')).toBeOnTheScreen();
  });

  it('on error shows the message and an exclamation mark; the artwork retries', async () => {
    const { player, state } = await listening();
    await render(<PlayerPanel side />);
    await act(async () => player.emitError());

    expect(screen.getByText(/Impossibile riprodurre/)).toBeOnTheScreen();
    expect(screen.queryByText('Riprova')).toBeNull();
    expect(screen.getByTestId('glyph-error')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Riprova' }));
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

      await fireEvent.press(screen.getByRole('button', { name: 'Riprova' }));
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

    await fireEvent.press(screen.getByRole('button', { name: 'Apri il player: Radio a' }));
    expect(router.push).toHaveBeenCalledWith('/player');

    await fireEvent.press(screen.getByRole('button', { name: 'Metti in pausa' }));
    expect(state().player.status).toBe('paused');
  });
});
