import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

import { getStation } from '@/db/queries/stations';
import { addFavorite } from '@/db/queries/favorites';
import { addListeningTime } from '@/db/queries/listeningTime';
import { isUpdateCheckEnabled } from '@/db/queries/updateCheck';
import { MiniPlayer } from '@/components/MiniPlayer';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { CatalogScreen } from '@/screens/catalog';
import { DiscoverScreen } from '@/screens/discover';
import { FavoritesScreen } from '@/screens/favorites';
import { PlayerScreen } from '@/screens/player';
import { SearchScreen } from '@/screens/search';
import { TagsScreen } from '@/screens/tags';
import { WelcomeScreen } from '@/screens/welcome';
import { loadCatalogState } from '@/services/catalog-sync/loadCatalogState';
import { toggleFavorite } from '@/services/favorites/toggleFavorite';
import { router } from '@test/fakes/fakeRouter';
import { rawStations } from '@test/fakes/fakeDirectory';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { startTestApp } from '@test/ui/startTestApp';

jest.mock('expo-router', () => jest.requireActual('@test/fakes/fakeRouter'));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.2.3' } } }));

const radio = (uuid: string, name: string, tags = 'jazz') => rawStation({ stationuuid: uuid, name, tags, country: 'Italy' });

beforeEach(() => jest.clearAllMocks());

const NO_ANSWER = 'No, I use Obtainium or update by hand';
const answerUpdateQuestion = (answer: string) => fireEvent.press(screen.getByRole('button', { name: answer }));

describe('Welcome (no local catalog)', () => {
  it.each([
    ['Yes', true],
    [NO_ANSWER, false],
  ])('asks about update checks once; "%s" is stored', async (answer, expected) => {
    const { db } = await startTestApp();
    await render(<WelcomeScreen />);
    expect(screen.getByText('Check for new versions when I open NoSpyFi? It contacts GitHub.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Download catalogue' })).toBeNull();

    await answerUpdateQuestion(answer);

    expect(await screen.findByRole('button', { name: 'Download catalogue' })).toBeOnTheScreen();
    expect(screen.queryByText(/contacts GitHub/)).toBeNull();
    expect(await isUpdateCheckEnabled(db)).toBe(expected);
  });

  it('asks before downloading and explains that Internet is needed', async () => {
    const { directory } = await startTestApp();
    await render(<WelcomeScreen />);
    await answerUpdateQuestion(NO_ANSWER);
    expect(await screen.findByRole('button', { name: 'Download catalogue' })).toBeOnTheScreen();
    expect(screen.getByText(/internet connection/)).toBeOnTheScreen();
    expect(directory.pages).toEqual([]);
  });

  it('downloads on request and activates the catalog', async () => {
    const { directory, state } = await startTestApp();
    directory.setMirror('mirror', rawStations(3));
    await render(<WelcomeScreen />);
    await answerUpdateQuestion(NO_ANSWER);

    await fireEvent.press(await screen.findByRole('button', { name: 'Download catalogue' }));

    await waitFor(() => expect(state().catalog.stationCount).toBe(3));
  });

  it('shows real progress and can be cancelled, without inventing stations', async () => {
    const { directory } = await startTestApp();
    directory.setMirror('mirror', rawStations(1500));
    directory.beforePage((_m, offset, signal) =>
      offset >= 1000 ? new Promise((_, reject) => signal?.addEventListener('abort', () => reject(new Error('x')))) : undefined,
    );
    await render(<WelcomeScreen />);
    await answerUpdateQuestion(NO_ANSWER);
    await fireEvent.press(await screen.findByRole('button', { name: 'Download catalogue' }));

    expect(await screen.findByText('1000 stations received')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Catalogue unavailable')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  });

  it('offers a retry when the download fails', async () => {
    const { directory } = await startTestApp();
    directory.setMirror('mirror', new TypeError('offline'));
    await render(<WelcomeScreen />);
    await answerUpdateQuestion(NO_ANSWER);
    await fireEvent.press(await screen.findByRole('button', { name: 'Download catalogue' }));
    expect(await screen.findByText('Catalogue unavailable')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  });
});

describe('Discover', () => {
  const catalog = [radio('a', 'Alfa', 'Jazz,Soul'), radio('b', 'Beta', 'jazz'), radio('c', 'Gamma', 'Rock')];

  it('shows tag groups with real counts and no list of all the radios, with no invented picks', async () => {
    await startTestApp(catalog);
    await render(<DiscoverScreen />);

    expect(await screen.findByRole('button', { name: /^Jazz, 2 stations|^jazz, 2 stations/i })).toBeOnTheScreen();
    expect(screen.queryByText('Alfa')).toBeNull();
    expect(screen.queryByText('All stations')).toBeNull();
    expect(screen.queryByText('Most played')).toBeNull(); // nothing listened yet
    expect(screen.queryByText('Picked for you')).toBeNull();
    expect(screen.queryByText('Midnight Jazz')).toBeNull();
  });

  it('shows the most listened favorites before the tags, and a tap plays among them', async () => {
    const { db, state } = await startTestApp([...catalog, radio('d', 'Delta')]);
    for (const [uuid, seconds] of [['a', 10], ['b', 40], ['c', 30], ['d', 20]] as const) {
      await addFavorite(db, (await getStation(db, uuid))!);
      await addListeningTime(db, uuid, seconds);
    }
    await loadCatalogState();
    await render(<DiscoverScreen />);

    await screen.findByRole('button', { name: 'Play Beta' });
    const pills = screen.getAllByRole('button', { name: /^Play / }).map((b) => b.props.accessibilityLabel);
    expect(pills).toEqual(['Play Beta', 'Play Gamma', 'Play Delta', 'Play Alfa']);
    expect(screen.getAllByText(/^(Most played|Genres & tags)$/).map((t) => t.props.children)).toEqual([
      'Most played',
      'Genres & tags',
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Play Gamma' }));
    await waitFor(() => expect(state().player.station?.uuid).toBe('c'));
    expect(state().player).toMatchObject({ canPrevious: true, canNext: true });
  });

  it('a station listened to before being saved joins the section once it is a favorite', async () => {
    const { db } = await startTestApp(catalog);
    await addListeningTime(db, 'a', 60);
    await render(<DiscoverScreen />);
    await screen.findByRole('button', { name: 'Rock, 1 station' });
    expect(screen.queryByText('Most played')).toBeNull();

    const alfa = (await getStation(db, 'a'))!;
    await act(() => toggleFavorite(alfa));
    expect(await screen.findByRole('button', { name: 'Play Alfa' })).toBeOnTheScreen();
  });

  it.each([
    ['compact', null],
    ['three-column', { width: 1280, height: 800, scale: 2, fontScale: 1 }],
  ])('shows the NoSpyFi logo instead of a title in the %s layout', async (_, window) => {
    await startTestApp(catalog);
    if (window) jest.spyOn(Dimensions, 'get').mockReturnValue(window);
    await render(<DiscoverScreen />);
    expect(await screen.findByRole('button', { name: 'Rock, 1 station' })).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'NoSpyFi' })).toBeOnTheScreen();
    expect(screen.queryByText('RADIO')).toBeNull();
    expect(screen.queryByText('Your frequency.')).toBeNull();
    jest.restoreAllMocks();
  });

  it('a tag opens Search with that tag selected', async () => {
    const { state } = await startTestApp(catalog);
    await render(<DiscoverScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Rock, 1 station' }));
    expect(state().selectedTag).toEqual({ key: 'rock', label: 'Rock' });
    expect(router.navigate).toHaveBeenCalledWith('/search');
  });

  it('links to the full tag list and to the catalog section', async () => {
    await startTestApp(catalog);
    await render(<DiscoverScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'See all tags' }));
    expect(router.push).toHaveBeenCalledWith('/tags');
    await fireEvent.press(screen.getByRole('button', { name: 'About NoSpyFi' }));
    expect(router.push).toHaveBeenCalledWith('/catalog');
  });
});

describe('Search', () => {
  const catalog = [radio('a', 'Café Jazz', 'jazz'), radio('b', 'Café Soul', 'soul'), radio('c', 'Rock FM', 'rock')];

  it('filters by name, ignoring accents, and combines with the selected tag', async () => {
    const { state } = await startTestApp(catalog);
    await render(<SearchScreen />);
    await fireEvent.changeText(screen.getByLabelText('Search by name'), 'cafe');
    expect(await screen.findByText('Café Soul')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Rock FM')).toBeNull());

    await fireEvent.press(await screen.findByRole('button', { name: 'jazz' }));
    await waitFor(() => expect(screen.queryByText('Café Soul')).toBeNull());
    expect(screen.getByText('Café Jazz')).toBeOnTheScreen();
    expect(state().searchQuery).toBe('cafe');
  });

  it('tells "no radio found" apart from a database error', async () => {
    const { db } = await startTestApp(catalog);
    await render(<SearchScreen />);
    await fireEvent.changeText(screen.getByLabelText('Search by name'), 'zzz');
    expect(await screen.findByText('No stations found')).toBeOnTheScreen();

    const spy = jest.spyOn(db, 'getAllAsync').mockRejectedValue(new Error('disk'));
    await fireEvent.changeText(screen.getByLabelText('Search by name'), 'yyy');
    expect(await screen.findByText('Database error')).toBeOnTheScreen();
    expect(screen.queryByText('No stations found')).toBeNull();

    spy.mockRestore();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('No stations found')).toBeOnTheScreen();
  });

  it('clears the query', async () => {
    const { state } = await startTestApp(catalog);
    await render(<SearchScreen />);
    await fireEvent.changeText(screen.getByLabelText('Search by name'), 'cafe');
    await fireEvent.press(await screen.findByRole('button', { name: 'Clear search' }));
    expect(state().searchQuery).toBe('');
  });
});

describe('Favorites', () => {
  it('when empty explains and links to Discover', async () => {
    await startTestApp([radio('a', 'Alfa')]);
    await render(<FavoritesScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Go to Discover' }));
    expect(router.navigate).toHaveBeenCalledWith('/');
  });

  it('lists favorites and drops one as soon as the heart is pressed', async () => {
    const { db } = await startTestApp([radio('a', 'Alfa')]);
    await addFavorite(db, (await getStation(db, 'a'))!);
    await loadCatalogState();
    await render(<FavoritesScreen />);

    expect(await screen.findByText('Alfa')).toBeOnTheScreen();
    expect(screen.getByText('1 favourite')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Remove from favourites' }));
    await waitFor(() => expect(screen.queryByText('Alfa')).toBeNull());
  });

  it('keeps a favorite that left the catalog, with a notice and "Try anyway"', async () => {
    const { db, directory, sync, state } = await startTestApp([radio('a', 'Alfa'), radio('b', 'Beta')]);
    await addFavorite(db, (await getStation(db, 'a'))!);
    directory.setMirror('mirror', [radio('b', 'Beta')]);
    await sync.refresh();
    await loadCatalogState();
    await render(<FavoritesScreen />);

    expect(await screen.findByText(/Not in the updated catalogue/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try anyway' }));
    await waitFor(() => expect(state().player.station?.uuid).toBe('a'));
    expect(state().player).toMatchObject({ canNext: false, canPrevious: false });
  });
});

describe('Tags', () => {
  it('lists every group and selects one for Search', async () => {
    const { state } = await startTestApp([radio('a', 'Alfa', 'Jazz,Blues')]);
    await render(<TagsScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Blues, 1 station' }));
    expect(state().selectedTag).toEqual({ key: 'blues', label: 'Blues' });
    expect(router.navigate).toHaveBeenCalledWith('/search');
  });
});

describe('About NoSpyFi', () => {
  it('titles the modal and shows the installed version apart from the catalogue', async () => {
    await startTestApp(rawStations(2));
    await render(<CatalogScreen />);
    expect(screen.getByRole('header', { name: 'About NoSpyFi' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'App updates' })).toBeOnTheScreen();
    expect(screen.getByText('Version 1.2.3')).toBeOnTheScreen();
  });

  it('has the update check off by default and persists the switch', async () => {
    const { db } = await startTestApp(rawStations(2));
    await render(<CatalogScreen />);
    const toggle = await screen.findByRole('switch', { name: 'Check for updates' });
    expect(toggle).toHaveProp('value', false);

    await fireEvent(toggle, 'valueChange', true);
    await waitFor(async () => expect(await isUpdateCheckEnabled(db)).toBe(true));
    expect(screen.getByRole('switch', { name: 'Check for updates' })).toHaveProp('value', true);

    await fireEvent(screen.getByRole('switch', { name: 'Check for updates' }), 'valueChange', false);
    await waitFor(async () => expect(await isUpdateCheckEnabled(db)).toBe(false));
  });
});

describe('Catalog section', () => {
  it('shows count and last success, and refreshes with a discreet confirmation', async () => {
    const { directory, state } = await startTestApp(rawStations(2));
    await render(<CatalogScreen />);
    expect(screen.getByText('2 stations stored on this device')).toBeOnTheScreen();
    expect(screen.getByText(/a few tens of MB/)).toBeOnTheScreen();

    directory.setMirror('mirror', rawStations(5));
    await fireEvent.press(screen.getByRole('button', { name: 'Refresh catalogue' }));

    expect(await screen.findByText('Catalogue updated')).toBeOnTheScreen();
    expect(state().catalog.stationCount).toBe(5);
    expect(screen.getByText('5 stations stored on this device')).toBeOnTheScreen();
  });

  it('an error keeps the copy and offers a retry', async () => {
    const { directory } = await startTestApp(rawStations(2));
    await render(<CatalogScreen />);
    directory.setMirror('mirror', new TypeError('offline'));
    await fireEvent.press(screen.getByRole('button', { name: 'Refresh catalogue' }));

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeOnTheScreen();
    expect(screen.getByText('2 stations stored on this device')).toBeOnTheScreen();
  });
});

it.each([
  ['Search', SearchScreen, 'Search'],
  ['Favorites', FavoritesScreen, 'Your stations'],
])('%s shows the NoSpyFi logo instead of its title', async (_, Screen, title) => {
  await startTestApp([radio('a', 'Alfa')]);
  await render(<Screen />);
  expect(await screen.findByRole('image', { name: 'NoSpyFi' })).toBeOnTheScreen();
  expect(screen.queryByText(title)).toBeNull();
});

describe('Mini-player', () => {
  it('shows what the stream announces while playing, and the status otherwise', async () => {
    const { db, audio, player } = await startTestApp([radio('a', 'Alfa')]);
    const alfa = toSnapshot((await getStation(db, 'a'))!);
    await render(<MiniPlayer />);
    await act(async () => audio.play(alfa, { uuids: ['a'], index: 0 }));
    await act(async () => {
      player.emitPlaying();
      player.emitTitle('Miles Davis - So What');
    });
    expect(screen.getByText('Miles Davis - So What')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('Paused')).toBeOnTheScreen();
    expect(screen.queryByText('Miles Davis - So What')).toBeNull();
  });
});

describe('Full player route', () => {
  it('stays open in portrait: there is no room for three columns', async () => {
    await startTestApp();
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 411, height: 915, scale: 2.6, fontScale: 1 });
    await render(<PlayerScreen />);
    await act(async () => {});
    expect(router.back).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('shows what the stream announces under the station name', async () => {
    const { db, audio, player } = await startTestApp([radio('a', 'Alfa')]);
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 411, height: 915, scale: 2.6, fontScale: 1 });
    await render(<PlayerScreen />);
    await act(async () => audio.play(toSnapshot((await getStation(db, 'a'))!), { uuids: ['a'], index: 0 }));
    await act(async () => {
      player.emitPlaying();
      player.emitTitle('Miles Davis - So What');
    });
    expect(screen.getByText('Miles Davis - So What')).toBeOnTheScreen();
    jest.restoreAllMocks();
  });

  it('closes itself in landscape, even on a short car box: the side panel takes over', async () => {
    await startTestApp();
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 1024, height: 552, scale: 1, fontScale: 1 });
    await render(<PlayerScreen />);
    await act(async () => {});
    expect(router.back).toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});
