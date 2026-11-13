import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

import { getStation } from '@/db/queries/stations';
import { addFavorite } from '@/db/queries/favorites';
import { addListeningTime } from '@/db/queries/listeningTime';
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

const radio = (uuid: string, name: string, tags = 'jazz') => rawStation({ stationuuid: uuid, name, tags, country: 'Italia' });

beforeEach(() => jest.clearAllMocks());

describe('Welcome (no local catalog)', () => {
  it('asks before downloading and explains that Internet is needed', async () => {
    const { directory } = await startTestApp();
    await render(<WelcomeScreen />);
    expect(screen.getByRole('button', { name: 'Scarica catalogo' })).toBeOnTheScreen();
    expect(screen.getByText(/connessione a Internet/)).toBeOnTheScreen();
    expect(directory.pages).toEqual([]);
  });

  it('downloads on request and activates the catalog', async () => {
    const { directory, state } = await startTestApp();
    directory.setMirror('mirror', rawStations(3));
    await render(<WelcomeScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Scarica catalogo' }));

    await waitFor(() => expect(state().catalog.stationCount).toBe(3));
  });

  it('shows real progress and can be cancelled, without inventing stations', async () => {
    const { directory } = await startTestApp();
    directory.setMirror('mirror', rawStations(1500));
    directory.beforePage((_m, offset, signal) =>
      offset >= 1000 ? new Promise((_, reject) => signal?.addEventListener('abort', () => reject(new Error('x')))) : undefined,
    );
    await render(<WelcomeScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Scarica catalogo' }));

    expect(await screen.findByText('1000 radio ricevute')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Annulla' }));

    expect(await screen.findByText('Catalogo non disponibile')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Riprova' })).toBeOnTheScreen();
  });

  it('offers a retry when the download fails', async () => {
    const { directory } = await startTestApp();
    directory.setMirror('mirror', new TypeError('offline'));
    await render(<WelcomeScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Scarica catalogo' }));
    expect(await screen.findByText('Catalogo non disponibile')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Riprova' })).toBeOnTheScreen();
  });
});

describe('Discover', () => {
  const catalog = [radio('a', 'Alfa', 'Jazz,Soul'), radio('b', 'Beta', 'jazz'), radio('c', 'Gamma', 'Rock')];

  it('shows tag groups with real counts and no list of all the radios, with no invented picks', async () => {
    await startTestApp(catalog);
    await render(<DiscoverScreen />);

    expect(await screen.findByRole('button', { name: /^Jazz, 2 radio|^jazz, 2 radio/i })).toBeOnTheScreen();
    expect(screen.queryByText('Alfa')).toBeNull();
    expect(screen.queryByText('Tutte le radio')).toBeNull();
    expect(screen.queryByText('I più ascoltati')).toBeNull(); // nothing listened yet
    expect(screen.queryByText('Scelte per te')).toBeNull();
    expect(screen.queryByText('Midnight Jazz')).toBeNull();
  });

  it('shows the three most listened favorites before the tags, and a tap plays among them', async () => {
    const { db, state } = await startTestApp([...catalog, radio('d', 'Delta')]);
    for (const [uuid, seconds] of [['a', 10], ['b', 40], ['c', 30], ['d', 20]] as const) {
      await addFavorite(db, (await getStation(db, uuid))!);
      await addListeningTime(db, uuid, seconds);
    }
    await loadCatalogState();
    await render(<DiscoverScreen />);

    await screen.findByRole('button', { name: 'Ascolta Beta' });
    const pills = screen.getAllByRole('button', { name: /^Ascolta / }).map((b) => b.props.accessibilityLabel);
    expect(pills).toEqual(['Ascolta Beta', 'Ascolta Gamma', 'Ascolta Delta']);
    expect(screen.getAllByText(/^(I più ascoltati|Generi e tag)$/).map((t) => t.props.children)).toEqual([
      'I più ascoltati',
      'Generi e tag',
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Ascolta Gamma' }));
    await waitFor(() => expect(state().player.station?.uuid).toBe('c'));
    expect(state().player).toMatchObject({ canPrevious: true, canNext: true });
  });

  it('a station listened to before being saved joins the section once it is a favorite', async () => {
    const { db } = await startTestApp(catalog);
    await addListeningTime(db, 'a', 60);
    await render(<DiscoverScreen />);
    await screen.findByRole('button', { name: 'Rock, 1 radio' });
    expect(screen.queryByText('I più ascoltati')).toBeNull();

    const alfa = (await getStation(db, 'a'))!;
    await act(() => toggleFavorite(alfa));
    expect(await screen.findByRole('button', { name: 'Ascolta Alfa' })).toBeOnTheScreen();
  });

  it('shows no brand in the three-column layout', async () => {
    await startTestApp(catalog);
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 1280, height: 800, scale: 2, fontScale: 1 });
    await render(<DiscoverScreen />);
    expect(await screen.findByRole('button', { name: 'Rock, 1 radio' })).toBeOnTheScreen();
    expect(screen.queryByText('RADIO')).toBeNull();
    jest.restoreAllMocks();
  });

  it('a tag opens Search with that tag selected', async () => {
    const { state } = await startTestApp(catalog);
    await render(<DiscoverScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Rock, 1 radio' }));
    expect(state().selectedTag).toEqual({ key: 'rock', label: 'Rock' });
    expect(router.navigate).toHaveBeenCalledWith('/search');
  });

  it('links to the full tag list and to the catalog section', async () => {
    await startTestApp(catalog);
    await render(<DiscoverScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Vedi tutti i tag' }));
    expect(router.push).toHaveBeenCalledWith('/tags');
    await fireEvent.press(screen.getByRole('button', { name: 'Catalogo radio' }));
    expect(router.push).toHaveBeenCalledWith('/catalog');
  });
});

describe('Search', () => {
  const catalog = [radio('a', 'Café Jazz', 'jazz'), radio('b', 'Café Soul', 'soul'), radio('c', 'Rock FM', 'rock')];

  it('filters by name, ignoring accents, and combines with the selected tag', async () => {
    const { state } = await startTestApp(catalog);
    await render(<SearchScreen />);
    await fireEvent.changeText(screen.getByLabelText('Cerca per nome'), 'cafe');
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
    await fireEvent.changeText(screen.getByLabelText('Cerca per nome'), 'zzz');
    expect(await screen.findByText('Nessuna radio trovata')).toBeOnTheScreen();

    const spy = jest.spyOn(db, 'getAllAsync').mockRejectedValue(new Error('disk'));
    await fireEvent.changeText(screen.getByLabelText('Cerca per nome'), 'yyy');
    expect(await screen.findByText('Errore del database')).toBeOnTheScreen();
    expect(screen.queryByText('Nessuna radio trovata')).toBeNull();

    spy.mockRestore();
    await fireEvent.press(screen.getByRole('button', { name: 'Riprova' }));
    expect(await screen.findByText('Nessuna radio trovata')).toBeOnTheScreen();
  });

  it('clears the query', async () => {
    const { state } = await startTestApp(catalog);
    await render(<SearchScreen />);
    await fireEvent.changeText(screen.getByLabelText('Cerca per nome'), 'cafe');
    await fireEvent.press(await screen.findByRole('button', { name: 'Cancella ricerca' }));
    expect(state().searchQuery).toBe('');
  });
});

describe('Favorites', () => {
  it('when empty explains and links to Discover', async () => {
    await startTestApp([radio('a', 'Alfa')]);
    await render(<FavoritesScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Vai a Scopri' }));
    expect(router.navigate).toHaveBeenCalledWith('/');
  });

  it('lists favorites and drops one as soon as the heart is pressed', async () => {
    const { db } = await startTestApp([radio('a', 'Alfa')]);
    await addFavorite(db, (await getStation(db, 'a'))!);
    await loadCatalogState();
    await render(<FavoritesScreen />);

    expect(await screen.findByText('Alfa')).toBeOnTheScreen();
    expect(screen.getByText('1 preferito')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Rimuovi dai preferiti' }));
    await waitFor(() => expect(screen.queryByText('Alfa')).toBeNull());
  });

  it('keeps a favorite that left the catalog, with a notice and "Prova comunque"', async () => {
    const { db, directory, sync, state } = await startTestApp([radio('a', 'Alfa'), radio('b', 'Beta')]);
    await addFavorite(db, (await getStation(db, 'a'))!);
    directory.setMirror('mirror', [radio('b', 'Beta')]);
    await sync.refresh();
    await loadCatalogState();
    await render(<FavoritesScreen />);

    expect(await screen.findByText(/Non presente nel catalogo aggiornato/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Prova comunque' }));
    await waitFor(() => expect(state().player.station?.uuid).toBe('a'));
    expect(state().player).toMatchObject({ canNext: false, canPrevious: false });
  });
});

describe('Tags', () => {
  it('lists every group and selects one for Search', async () => {
    const { state } = await startTestApp([radio('a', 'Alfa', 'Jazz,Blues')]);
    await render(<TagsScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Blues, 1 radio' }));
    expect(state().selectedTag).toEqual({ key: 'blues', label: 'Blues' });
    expect(router.navigate).toHaveBeenCalledWith('/search');
  });
});

describe('Catalog section', () => {
  it('shows count and last success, and refreshes with a discreet confirmation', async () => {
    const { directory, state } = await startTestApp(rawStations(2));
    await render(<CatalogScreen />);
    expect(screen.getByText('2 radio in questa copia')).toBeOnTheScreen();
    expect(screen.getByText(/alcune decine di MB/)).toBeOnTheScreen();

    directory.setMirror('mirror', rawStations(5));
    await fireEvent.press(screen.getByRole('button', { name: 'Riscarica catalogo' }));

    expect(await screen.findByText('Catalogo aggiornato')).toBeOnTheScreen();
    expect(state().catalog.stationCount).toBe(5);
    expect(screen.getByText('5 radio in questa copia')).toBeOnTheScreen();
  });

  it('an error keeps the copy and offers a retry', async () => {
    const { directory } = await startTestApp(rawStations(2));
    await render(<CatalogScreen />);
    directory.setMirror('mirror', new TypeError('offline'));
    await fireEvent.press(screen.getByRole('button', { name: 'Riscarica catalogo' }));

    expect(await screen.findByRole('button', { name: 'Riprova' })).toBeOnTheScreen();
    expect(screen.getByText('2 radio in questa copia')).toBeOnTheScreen();
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

  it('closes itself in landscape, even on a short car box: the side panel takes over', async () => {
    await startTestApp();
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 1024, height: 552, scale: 1, fontScale: 1 });
    await render(<PlayerScreen />);
    await act(async () => {});
    expect(router.back).toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});
