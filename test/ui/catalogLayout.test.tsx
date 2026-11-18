import { render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

import { CatalogScreen } from '@/screens/catalog';
import { startTestApp } from '@test/ui/startTestApp';

jest.mock('expo-router', () => jest.requireActual('@test/fakes/fakeRouter'));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.2.3' } } }));

describe('About NoSpyFi layout', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['portrait', { width: 411, height: 915, scale: 2.6, fontScale: 1 }],
    ['landscape', { width: 1024, height: 552, scale: 1, fontScale: 1 }],
  ])('shows the catalogue and the app updates in %s', async (_, window) => {
    await startTestApp();
    jest.spyOn(Dimensions, 'get').mockReturnValue(window);
    await render(<CatalogScreen />);

    expect(screen.getByText('0 stations stored on this device')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Refresh catalogue' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'App updates' })).toBeOnTheScreen();
    expect(screen.getByText('Version 1.2.3')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Check now' })).toBeOnTheScreen();
  });
});
