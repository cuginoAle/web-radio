import { autostart } from '@/services/audio/autostart';
import { createAudioSession } from '@/services/audio/createAudioSession';
import type { StationSnapshot } from '@/services/audio/types';
import { createGlobalStore } from '@/state/global-state';
import { FakeAudioPlayer } from '@test/fakes/fakeAudioPlayer';

const stored: StationSnapshot = {
  uuid: 'a',
  name: 'Radio A',
  streamUrl: 'https://old.example/a',
  favicon: null,
  subtitle: 'jazz · Italy',
};
const inCatalog: StationSnapshot = { ...stored, streamUrl: 'https://new.example/a' };

function setup() {
  const player = new FakeAudioPlayer();
  const store = createGlobalStore();
  const session = createAudioSession({ player, store, resolveStation: async () => null });
  return { player, session, state: () => store.getState().player };
}

it('plays the catalogue copy of the last station, with previous and next disabled', async () => {
  const { player, session, state } = setup();
  await autostart(session, stored, async () => inCatalog);

  expect(player.uri).toBe('https://new.example/a');
  expect(state()).toMatchObject({ status: 'loading', station: inCatalog, canPrevious: false, canNext: false });
});

it('plays the stored copy when the catalogue no longer has the station', async () => {
  const { player, session } = setup();
  await autostart(session, stored, async () => null);
  expect(player.uri).toBe('https://old.example/a');
});

it('plays the stored copy when the catalogue cannot be read', async () => {
  const { player, session } = setup();
  await autostart(session, stored, async () => Promise.reject(new Error('db closed')));
  expect(player.uri).toBe('https://old.example/a');
});

it('stays idle when no station has ever played', async () => {
  const { player, session, state } = setup();
  await autostart(session, null, async () => inCatalog);

  expect(player.uri).toBeNull();
  expect(state().status).toBe('idle');
});
