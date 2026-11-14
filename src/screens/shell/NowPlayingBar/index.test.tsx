import { act, render, screen } from '@testing-library/react-native';

import { getStation } from '@/db/queries/stations';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { NowPlayingBar } from '@/screens/shell/NowPlayingBar';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { startTestApp } from '@test/ui/startTestApp';

jest.mock('expo-router', () => jest.requireActual('@test/fakes/fakeRouter'));

const SONG = 'Miles Davis - So What';

async function listening() {
  const app = await startTestApp([rawStation({ stationuuid: 'a', name: 'Alfa' })]);
  const alfa = toSnapshot((await getStation(app.db, 'a'))!);
  await act(async () => app.audio.play(alfa, { uuids: ['a'], index: 0 }));
  return app;
}

describe('NowPlayingBar (landscape bottom line)', () => {
  it('is absent when nothing is selected', async () => {
    await startTestApp([]);
    await render(<NowPlayingBar />);
    expect(screen.queryByTestId('now-playing-bar')).toBeNull();
  });

  it('shows what the stream announces while playing, and stays in place, blank, when paused', async () => {
    const { player, audio } = await listening();
    await render(<NowPlayingBar />);
    await act(async () => {
      player.emitPlaying();
      player.emitTitle(SONG);
    });
    expect(screen.getByText(SONG)).toBeOnTheScreen();

    await act(async () => audio.pause());
    expect(screen.queryByText(SONG)).toBeNull();
    expect(screen.getByTestId('now-playing-bar')).toBeOnTheScreen();
  });
});
