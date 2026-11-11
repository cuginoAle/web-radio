import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { StationRowContainer } from '@/components/StationRowContainer';
import { getStation, listStationUuids } from '@/db/queries/stations';
import { listFavoriteUuids } from '@/db/queries/favorites';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { startTestApp } from '@test/ui/startTestApp';

const catalog = [
  rawStation({ stationuuid: 'a', name: 'Alfa Radio', tags: 'jazz', country: 'Italia' }),
  rawStation({ stationuuid: 'b', name: 'Beta Radio', tags: 'jazz', lastcheckok: 0 }),
];

async function setup(uuid = 'a') {
  const app = await startTestApp(catalog);
  const station = (await getStation(app.db, uuid))!;
  await render(<StationRowContainer station={station} loadUuids={() => listStationUuids(app.db, {})} />);
  return app;
}

it('shows the real data of the station', async () => {
  await setup();
  expect(screen.getByText('Alfa Radio')).toBeOnTheScreen();
  expect(screen.getByText('jazz · Italia')).toBeOnTheScreen();
});

it('warns when the last directory check failed', async () => {
  await setup('b');
  expect(screen.getByText('Ultimo controllo non riuscito')).toBeOnTheScreen();
});

it('pressing play starts the station with its list frozen, then the button pauses', async () => {
  const { player, state } = await setup();

  await fireEvent.press(screen.getByRole('button', { name: 'Ascolta Alfa Radio' }));
  await waitFor(() => expect(state().player.status).toBe('loading'));
  expect(state().player).toMatchObject({ canNext: true, canPrevious: false });

  await act(async () => player.emitPlaying());
  await fireEvent.press(await screen.findByRole('button', { name: 'Metti in pausa Alfa Radio' }));
  expect(state().player.status).toBe('paused');
});

it('tapping the row itself also starts the station', async () => {
  const { state } = await setup();
  await fireEvent.press(screen.getByRole('button', { name: 'Alfa Radio, jazz · Italia' }));
  await waitFor(() => expect(state().player.station?.uuid).toBe('a'));
});

it('the heart adds and removes the favorite, on screen and on disk', async () => {
  const { db } = await setup();

  await fireEvent.press(screen.getByRole('button', { name: 'Aggiungi ai preferiti' }));
  await waitFor(async () => expect(await listFavoriteUuids(db)).toEqual(['a']));

  await fireEvent.press(await screen.findByRole('button', { name: 'Rimuovi dai preferiti' }));
  await waitFor(async () => expect(await listFavoriteUuids(db)).toEqual([]));
});
