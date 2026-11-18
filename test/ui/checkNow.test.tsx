import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import {
  isUpdateCheckEnabled,
  setInstallExplained,
  setLastCheckAt,
  setSnoozedUntil,
  setUpdateCheckEnabled,
  storeUpdate,
} from '@/db/queries/updateCheck';
import { CatalogScreen } from '@/screens/catalog';
import { DiscoverScreen } from '@/screens/discover';
import { json } from '@test/fakes/fakeFetch';
import { startTestApp } from '@test/ui/startTestApp';

jest.mock('expo-router', () => jest.requireActual('@test/fakes/fakeRouter'));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.2.3' } } }));

const URL = 'https://github.com/cuginoAle/web-radio/releases/download/v1.3.0/NoSpyFi-1.3.0.apk';
const release = (tag: string) =>
  json({ tag_name: tag, body: 'notes', assets: [{ name: `NoSpyFi-${tag.slice(1)}.apk`, browser_download_url: URL }] });
const NOTICE = 'NoSpyFi 1.3.0 is available. Installing stops the radio.';

const checkNow = () => act(async () => void fireEvent.press(screen.getByRole('button', { name: 'Check now' })));

describe('Check now in About NoSpyFi', () => {
  it('asks GitHub with the switch off, offers Install, and leaves the switch off', async () => {
    const { db, github } = await startTestApp();
    github.reply(release('v1.3.0'));
    await render(<CatalogScreen />);

    await checkNow();

    expect(await screen.findByText(NOTICE)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Install' })).toBeOnTheScreen();
    expect(github.requests).toHaveLength(1);
    expect(await isUpdateCheckEnabled(db)).toBe(false);
  });

  it('says so when the installed version is the latest', async () => {
    const { github } = await startTestApp();
    github.reply(release('v1.2.3'));
    await render(<CatalogScreen />);

    await checkNow();

    expect(await screen.findByText('You have the latest version.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Install' })).toBeNull();
  });

  it('shows Checking… with the button disabled until GitHub answers', async () => {
    const { github } = await startTestApp();
    let answer: (response: Response) => void = () => undefined;
    github.reply(() => new Promise<Response>((resolve) => (answer = resolve)));
    await render(<CatalogScreen />);

    await checkNow();

    expect(screen.getByText('Checking…')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Check now' })).toBeDisabled();
    await act(async () => answer(release('v1.2.3')));
    expect(await screen.findByText('You have the latest version.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Check now' })).toBeEnabled();
  });

  it('says it could not check when GitHub cannot be reached', async () => {
    const { github } = await startTestApp();
    github.reply(new Error('Network request failed'));
    await render(<CatalogScreen />);

    await checkNow();

    expect(await screen.findByText("Couldn't check for updates. Check your connection and try again.")).toBeOnTheScreen();
  });

  it('shows the update even after an earlier Not now; Not now hides it again', async () => {
    const { db, github, clock } = await startTestApp();
    await setSnoozedUntil(db, clock.now + 60_000);
    github.reply(release('v1.3.0'));
    await render(<CatalogScreen />);

    await checkNow();
    expect(await screen.findByText(NOTICE)).toBeOnTheScreen();

    await act(async () => void fireEvent.press(screen.getByRole('button', { name: 'Not now' })));
    expect(screen.queryByText(NOTICE)).toBeNull();
  });

  it('downloads one update at a time, even with Install on both Discover and About', async () => {
    const { db, github, clock, device } = await startTestApp();
    await setUpdateCheckEnabled(db, true);
    await storeUpdate(db, { version: '1.3.0', url: URL });
    await setLastCheckAt(db, clock.now);
    await setInstallExplained(db);
    github.reply(release('v1.3.0'));
    await render(
      <>
        <DiscoverScreen />
        <CatalogScreen />
      </>,
    );
    await screen.findByText(NOTICE); // Discover's notice
    await checkNow();
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Install' })).toHaveLength(2));

    const [onDiscover, onAbout] = screen.getAllByRole('button', { name: 'Install' });
    await act(async () => void fireEvent.press(onDiscover));
    await act(async () => void fireEvent.press(onAbout));

    expect(device.downloads).toHaveLength(1);
  });
});
