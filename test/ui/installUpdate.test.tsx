import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import { setLastCheckAt, setUpdateCheckEnabled, storeUpdate } from '@/db/queries/updateCheck';
import { DiscoverScreen } from '@/screens/discover';
import { startTestApp } from '@test/ui/startTestApp';

jest.mock('expo-router', () => jest.requireActual('@test/fakes/fakeRouter'));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.2.3' } } }));

const URL = 'https://github.com/cuginoAle/web-radio/releases/download/v1.3.0/NoSpyFi-1.3.0.apk';

async function showBanner() {
  const app = await startTestApp();
  await setUpdateCheckEnabled(app.db, true);
  await storeUpdate(app.db, { version: '1.3.0', url: URL });
  await setLastCheckAt(app.db, app.clock.now);
  await render(<DiscoverScreen />);
  await screen.findByRole('button', { name: 'Install' });
  return app;
}

/** Alert.alert is the boundary to the OS dialog: record it, press a button when the test says so. */
function spyOnAlert() {
  const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const press = (label: string) => {
    const buttons = spy.mock.calls[spy.mock.calls.length - 1][2] as AlertButton[];
    return act(async () => buttons.find((b) => b.text === label)?.onPress?.());
  };
  return { spy, press };
}

// Not awaited: the press handler stays pending until the test answers the dialog or finishes the download.
const tap = (name: string) =>
  act(async () => {
    void fireEvent.press(screen.getByRole('button', { name }));
  });
const install = () => tap('Install');

afterEach(() => jest.restoreAllMocks());

describe('Download and install', () => {
  it('explains the permission the first time only; Cancel does nothing', async () => {
    const { device } = await showBanner();
    const alert = spyOnAlert();

    await install();

    expect(alert.spy).toHaveBeenCalledWith(
      'Allow installing updates',
      'Android will ask you to allow NoSpyFi to install apps. Turn it on once: NoSpyFi only uses it when you tap Install.',
      [expect.objectContaining({ text: 'Cancel' }), expect.objectContaining({ text: 'Continue' })],
      expect.anything(),
    );
    await alert.press('Cancel');
    expect(device.downloads).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Install' })).toBeOnTheScreen();

    await install(); // Cancel stored nothing: still the first time
    expect(alert.spy).toHaveBeenCalledTimes(2);
  });

  it('Continue remembers it and downloads; the next Install goes straight to the download', async () => {
    const { device } = await showBanner();
    const alert = spyOnAlert();
    await install();
    await alert.press('Continue');
    expect(device.downloads.map((d) => d.url)).toEqual([URL]);

    await act(async () => device.downloads[0].fail());
    await tap('Retry');

    expect(alert.spy).toHaveBeenCalledTimes(1);
    expect(device.downloads).toHaveLength(2);
  });

  it('shows the progress and nothing tappable while downloading, then opens the installer', async () => {
    const { device } = await showBanner();
    const alert = spyOnAlert();
    await install();
    await alert.press('Continue');

    await act(async () => device.downloads[0].progress(42));
    expect(screen.getByText('Downloading NoSpyFi 1.3.0… 42%')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Install' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Not now' })).toBeNull();

    await act(async () => device.downloads[0].finish());
    expect(device.opened).toEqual([device.file]);
    expect(screen.getByRole('button', { name: 'Install' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Not now' })).toBeOnTheScreen();
  });

  it('discards the partial file and offers Retry when the download fails', async () => {
    const { device } = await showBanner();
    const alert = spyOnAlert();
    await install();
    await alert.press('Continue');

    await act(async () => device.downloads[0].fail());

    expect(device.calls.discard).toBe(1);
    expect(screen.getByText('Download failed.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Not now' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Install' })).toBeNull();
    expect(device.opened).toEqual([]);
  });

  it('treats a refused hand-off to the installer like a failed download', async () => {
    const { device } = await showBanner();
    device.calls.openError = new Error('unsupported');
    const alert = spyOnAlert();
    await install();
    await alert.press('Continue');

    await act(async () => device.downloads[0].finish());

    await waitFor(() => expect(screen.getByText('Download failed.')).toBeOnTheScreen());
    expect(device.calls.discard).toBe(1);
  });
});
