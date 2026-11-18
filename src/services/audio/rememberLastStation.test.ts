import { createAudioSession } from '@/services/audio/createAudioSession';
import { rememberLastStation } from '@/services/audio/rememberLastStation';
import type { StationSnapshot } from '@/services/audio/types';
import { createGlobalStore } from '@/state/global-state';
import { FakeAudioPlayer } from '@test/fakes/fakeAudioPlayer';

const station = (uuid: string): StationSnapshot => ({
  uuid,
  name: `Radio ${uuid}`,
  streamUrl: `https://stream.example/${uuid}`,
  favicon: null,
  subtitle: '',
});
const A = station('a');
const B = station('b');

function setup() {
  const player = new FakeAudioPlayer();
  const store = createGlobalStore();
  const session = createAudioSession({ player, store, resolveStation: async () => null });
  const saved: StationSnapshot[] = [];
  rememberLastStation(store, (s) => saved.push(s));
  return { player, session, saved };
}

it('remembers a station once it is audible', () => {
  const { player, session, saved } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  expect(saved).toEqual([]); // loading

  player.emitPlaying();
  expect(saved).toEqual([A]);
});

it('does not remember a station that never plays', () => {
  const { player, session, saved } = setup();
  session.play(A, { uuids: ['a', 'b'], index: 0 });
  player.emitPlaying();
  session.play(B, { uuids: ['a', 'b'], index: 1 });
  player.emitError();

  expect(saved).toEqual([A]);
});

it('remembers it once, not again after a pause or a dropout', () => {
  const { player, session, saved } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  player.emitPlaying();
  player.emit({ isBuffering: true });
  player.emitPlaying();
  session.pause();
  session.resume();
  player.emitPlaying();

  expect(saved).toEqual([A]);
});
