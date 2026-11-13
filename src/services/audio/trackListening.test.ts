import { createAudioSession } from '@/services/audio/createAudioSession';
import { trackListening } from '@/services/audio/trackListening';
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
  jest.useFakeTimers();
  const player = new FakeAudioPlayer();
  const store = createGlobalStore();
  const session = createAudioSession({ player, store, reportClick: () => {}, resolveStation: async () => null });
  const saved: [string, number][] = [];
  trackListening(store, (uuid, seconds) => saved.push([uuid, seconds]));
  const wait = (seconds: number) => jest.advanceTimersByTime(seconds * 1000);
  return { player, session, saved, wait };
}

afterEach(() => jest.useRealTimers());

it('counts only the seconds the stream is audible, and saves them on pause', () => {
  const { player, session, saved, wait } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  wait(5); // loading
  player.emitPlaying();
  wait(12);
  expect(saved).toEqual([]);

  session.pause();
  wait(60);
  expect(saved).toEqual([['a', 12]]);
});

it('saves the previous station when another one is chosen', () => {
  const { player, session, saved, wait } = setup();
  session.play(A, { uuids: ['a', 'b'], index: 0 });
  player.emitPlaying();
  wait(8);
  session.play(B, { uuids: ['a', 'b'], index: 1 });
  player.emitPlaying();
  wait(3);
  session.pause();

  expect(saved).toEqual([['a', 8], ['b', 3]]);
});

it('saves every 30 seconds while playing, so a killed app loses at most that', () => {
  const { player, session, saved, wait } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  player.emitPlaying();
  wait(65);
  expect(saved).toEqual([['a', 30], ['a', 30]]);

  session.pause();
  expect(saved).toEqual([['a', 30], ['a', 30], ['a', 5]]);
});

it('does not count buffering', () => {
  const { player, session, saved, wait } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  player.emitPlaying();
  wait(10);
  player.emit({ isBuffering: true });
  wait(20);
  player.emitPlaying();
  wait(5);
  session.pause();

  expect(saved).toEqual([['a', 10], ['a', 5]]);
});
