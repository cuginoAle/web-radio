import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { setUpdateCheckEnabled, setLastCheckAt, storeUpdate } from '@/db/queries/updateCheck';
import { DiscoverScreen } from '@/screens/discover';
import { json } from '@test/fakes/fakeFetch';
import { startTestApp } from '@test/ui/startTestApp';

jest.mock('expo-router', () => jest.requireActual('@test/fakes/fakeRouter'));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.2.3' } } }));

const DAY = 24 * 60 * 60 * 1000;
const URL = 'https://github.com/cuginoAle/web-radio/releases/download/v1.3.0/NoSpyFi-1.3.0.apk';
const release = (tag: string) =>
  json({ tag_name: tag, body: 'Secret notes', assets: [{ name: `NoSpyFi-${tag.slice(1)}.apk`, browser_download_url: URL }] });
const BANNER = 'NoSpyFi 1.3.0 is available. Installing stops the radio.';

afterEach(() => jest.restoreAllMocks());

describe('Update notice on Discover', () => {
  it('finds the update when the app opens and offers Install / Not now, without the release notes', async () => {
    const { db, github } = await startTestApp();
    await setUpdateCheckEnabled(db, true);
    github.reply(release('v1.3.0'));

    await render(<DiscoverScreen />);

    expect(await screen.findByText(BANNER)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Install' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Not now' })).toBeOnTheScreen();
    expect(screen.queryByText(/Secret notes/)).toBeNull();
    expect(github.requests).toHaveLength(1);
  });

  it('shows nothing and sends nothing while the setting is off', async () => {
    const { github } = await startTestApp();
    github.reply(release('v1.3.0'));

    await render(<DiscoverScreen />);
    await act(async () => {});

    expect(screen.queryByText(BANNER)).toBeNull();
    expect(github.requests).toEqual([]);
  });

  it('keeps showing a stored update on later opens without a new request', async () => {
    const { db, github, clock } = await startTestApp();
    await setUpdateCheckEnabled(db, true);
    await storeUpdate(db, { version: '1.3.0', url: URL });
    await setLastCheckAt(db, clock.now - 60_000);

    await render(<DiscoverScreen />);

    expect(await screen.findByText(BANNER)).toBeOnTheScreen();
    expect(github.requests).toEqual([]);
  });

  it('is gone once the installed version has caught up with the stored one', async () => {
    const { db, github, clock } = await startTestApp();
    await setUpdateCheckEnabled(db, true);
    await storeUpdate(db, { version: '1.2.3', url: URL });
    await setLastCheckAt(db, clock.now);

    await render(<DiscoverScreen />);
    await act(async () => {});

    expect(screen.queryByText(/is available/)).toBeNull();
    expect(github.requests).toEqual([]);
  });

  it('"Not now" hides it for 24 h, then it comes back', async () => {
    const { db, github, clock } = await startTestApp();
    await setUpdateCheckEnabled(db, true);
    await storeUpdate(db, { version: '1.3.0', url: URL });
    await setLastCheckAt(db, clock.now);
    const first = await render(<DiscoverScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Not now' }));
    expect(screen.queryByText(BANNER)).toBeNull();

    await first.unmount();
    clock.now += DAY - 1;
    const second = await render(<DiscoverScreen />);
    await act(async () => {});
    expect(screen.queryByText(BANNER)).toBeNull();

    await second.unmount();
    clock.now += 1;
    await render(<DiscoverScreen />);
    expect(await screen.findByText(BANNER)).toBeOnTheScreen();
    expect(github.requests).toHaveLength(1); // the 24 h check gate reopened (the empty fake fails, silently)
  });

  it('checks again when the app returns to the foreground a day later', async () => {
    const { db, github, clock } = await startTestApp();
    await setUpdateCheckEnabled(db, true);
    github.reply(release('v1.2.3'));
    let onChange: (state: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      onChange = listener as typeof onChange;
      return { remove: jest.fn() };
    });
    await render(<DiscoverScreen />);
    await waitFor(() => expect(github.requests).toHaveLength(1));

    clock.now += DAY;
    github.reply(release('v1.3.0'));
    await act(async () => onChange('background'));
    await act(async () => onChange('active'));

    expect(await screen.findByText(BANNER)).toBeOnTheScreen();
    expect(github.requests).toHaveLength(2);
  });
});
