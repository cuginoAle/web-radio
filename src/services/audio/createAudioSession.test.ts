import { createAudioSession } from '@/services/audio/createAudioSession';
import type { StationSnapshot } from '@/services/audio/types';
import { createGlobalStore } from '@/state/global-state';
import { FakeAudioPlayer } from '@test/fakes/fakeAudioPlayer';

const station = (uuid: string): StationSnapshot => ({
  uuid,
  name: `Radio ${uuid}`,
  streamUrl: `https://stream.example/${uuid}`,
  favicon: null,
  subtitle: 'jazz · Italia',
});
const A = station('a');

function setup(resolveStation: (uuid: string) => Promise<StationSnapshot | null> = async () => null) {
  const player = new FakeAudioPlayer();
  const store = createGlobalStore();
  const clicks: string[] = [];
  const session = createAudioSession({
    player,
    store,
    reportClick: (uuid) => clicks.push(uuid),
    resolveStation,
  });
  const state = () => store.getState().player;
  return { player, session, state, clicks };
}

afterEach(() => jest.useRealTimers());

it('shows the chosen station as loading until the stream actually plays', () => {
  const { player, session, state } = setup();

  session.play(A, { uuids: ['a'], index: 0 });
  expect(state()).toMatchObject({ status: 'loading', station: A });
  expect(player.uri).toBe(A.streamUrl);

  player.emitPlaying();
  expect(state().status).toBe('playing');
});

it('pauses, and resuming goes back to the live stream instead of the paused position', () => {
  const { player, session, state } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  player.emitPlaying();

  session.pause();
  expect(state().status).toBe('paused');
  expect(player.playing).toBe(false);

  player.uri = null; // forget the source so we can see it being reloaded
  session.resume();
  expect(state().status).toBe('loading');
  expect(player.uri).toBe(A.streamUrl);
  expect(player.playing).toBe(true);
});

it('shows an understandable error when a station never starts, and keeps it on later status updates', () => {
  jest.useFakeTimers();
  const { player, session, state } = setup();
  session.play(A, { uuids: ['a'], index: 0 });

  player.emitError('Source error');
  player.emit({ playing: false, playbackState: 'idle' }); // expo-audio clears `error` on the next update
  jest.advanceTimersByTime(10_000);

  expect(state().status).toBe('error');
  expect(state().error).toMatch(/Impossibile riprodurre/);
  expect(player.playing).toBe(false);
});

it('reconnects an interrupted stream at most twice with growing waits, then asks the user to retry', () => {
  jest.useFakeTimers();
  const { player, session, state } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  player.emitPlaying();

  player.emitError();
  expect(state().status).toBe('buffering');
  player.uri = null;
  jest.advanceTimersByTime(1_999);
  expect(player.uri).toBeNull();
  jest.advanceTimersByTime(1);
  expect(player.uri).toBe(A.streamUrl); // 1st reconnection after 2 s

  player.emitError();
  expect(state().status).toBe('buffering');
  player.uri = null;
  jest.advanceTimersByTime(3_999);
  expect(player.uri).toBeNull();
  jest.advanceTimersByTime(1);
  expect(player.uri).toBe(A.streamUrl); // 2nd reconnection after 4 s more

  player.emitError();
  expect(state().status).toBe('error');
  player.uri = null;
  jest.advanceTimersByTime(60_000);
  expect(player.uri).toBeNull(); // no endless retry loop
});

it('a pending reconnection never brings back a station after pausing or choosing another one', () => {
  jest.useFakeTimers();
  const B = station('b');
  const { player, session, state } = setup();
  session.play(A, { uuids: ['a', 'b'], index: 0 });
  player.emitPlaying();
  player.emitError(); // reconnection to A scheduled

  session.play(B, { uuids: ['a', 'b'], index: 1 });
  jest.advanceTimersByTime(60_000);
  expect(player.uri).toBe(B.streamUrl);
  expect(state().station).toEqual(B);

  player.emitPlaying();
  player.emitError(); // reconnection to B scheduled
  session.pause();
  jest.advanceTimersByTime(60_000);
  expect(player.playing).toBe(false);
  expect(state().status).toBe('paused');
});

it('shows buffering while a playing stream stalls, but loading before it ever played', () => {
  const { player, session, state } = setup();
  session.play(A, { uuids: ['a'], index: 0 });

  player.emit({ playing: true, isBuffering: true, playbackState: 'buffering' });
  expect(state().status).toBe('loading');

  player.emitPlaying();
  player.emit({ playing: true, isBuffering: true, playbackState: 'buffering' });
  expect(state().status).toBe('buffering');

  player.emitPlaying();
  expect(state().status).toBe('playing');
});

it('reflects play and pause coming from the notification or lock screen', () => {
  const { player, session, state } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  player.emitPlaying();

  player.emit({ playing: false, playbackState: 'ready', isLoaded: true }); // paused from the notification
  expect(state().status).toBe('paused');

  player.emit({ playing: false, isBuffering: true, playbackState: 'buffering' });
  expect(state().status).toBe('paused');

  player.emitPlaying(); // resumed from the notification
  expect(state().status).toBe('playing');
});

it('a late "playing" update that was already in flight does not undo the user pause', () => {
  const { player, session, state } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  player.emitPlaying();

  session.pause();
  player.emit({ playing: true, playbackState: 'ready', isLoaded: true }); // stale tick sent before the pause
  expect(state().status).toBe('paused');
});

it('retry after an error loads the same station again', () => {
  const { player, session, state } = setup();
  session.play(A, { uuids: ['a'], index: 0 });
  player.emitError();

  player.uri = null;
  session.retry();
  expect(state()).toMatchObject({ status: 'loading', station: A, error: null });
  expect(player.uri).toBe(A.streamUrl);

  player.emitPlaying();
  expect(state().status).toBe('playing');
});

it('shows the station on the lock screen and notification, without invented track info', () => {
  const B = { ...station('b'), favicon: 'https://img.example/b.png' };
  const { player, session } = setup();

  session.play(A, { uuids: ['a', 'b'], index: 0 });
  expect(player.lockScreen).toEqual({ title: 'Radio a', artist: 'Radio in diretta' });

  session.play(B, { uuids: ['a', 'b'], index: 1 });
  expect(player.lockScreen).toEqual({ title: 'Radio b', artist: 'Radio in diretta', artworkUrl: B.favicon });
});

it('reports a click to the directory only when the user chooses a station', () => {
  jest.useFakeTimers();
  const { player, session, clicks } = setup();
  session.play(A, { uuids: ['a', 'b'], index: 0 });
  player.emitPlaying();
  player.emitError();
  jest.advanceTimersByTime(2_000); // reconnection
  session.pause();
  session.resume();
  player.emitError();
  session.retry();

  session.play(station('b'), { uuids: ['a', 'b'], index: 1 });
  expect(clicks).toEqual(['a', 'b']);
});

it('previous/next walk the frozen source list, skipping stations no longer in the catalog', async () => {
  const C = station('c');
  const catalog: Record<string, StationSnapshot> = { a: A, c: C }; // "b" disappeared after a refresh
  const { session, state } = setup(async (uuid) => catalog[uuid] ?? null);

  session.play(A, { uuids: ['a', 'b', 'c'], index: 0 });
  expect(state()).toMatchObject({ canPrevious: false, canNext: true });

  await session.next();
  expect(state()).toMatchObject({ station: C, canPrevious: true, canNext: false });

  await session.previous();
  expect(state()).toMatchObject({ station: A, canPrevious: false, canNext: true });
});

it('a slow next() never overrides what the user did in the meantime', async () => {
  let release: (s: StationSnapshot) => void = () => {};
  const B = station('b');
  const C = station('c');
  const { player, session, state } = setup(() => new Promise((r) => (release = r)));

  session.play(A, { uuids: ['a', 'b'], index: 0 });
  const pendingNext = session.next();
  session.play(C, { uuids: ['c', 'b'], index: 0 });
  release(B);
  await pendingNext;
  expect(state().station).toEqual(C);

  const pendingAfterPause = session.next();
  session.pause();
  release(B);
  await pendingAfterPause;
  expect(state().status).toBe('paused');
  expect(player.playing).toBe(false);
});

it('a station without a playable URL shows the error without touching the player', () => {
  const { player, session, state } = setup();

  session.play({ ...A, streamUrl: '' }, { uuids: ['a'], index: 0 });

  expect(state().status).toBe('error');
  expect(state().error).toMatch(/Impossibile riprodurre/);
  expect(player.uri).toBeNull();
  expect(player.playing).toBe(false);
});

it('an unsupported source that makes the native player throw becomes the same error', () => {
  const { player, session, state } = setup();
  player.replace = () => {
    throw new Error('Unsupported type');
  };

  session.play(A, { uuids: ['a'], index: 0 });

  expect(state().status).toBe('error');
});
