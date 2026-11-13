import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { renderRouter, screen } from 'expo-router/testing-library';

import { NavBar } from '@/screens/shell/NavBar';

function RailLayout() {
  return (
    <Tabs>
      <TabList>
        <TabTrigger name="discover" href="/" />
        <TabTrigger name="search" href="/search" />
        <TabTrigger name="favorites" href="/favorites" />
      </TabList>
      <NavBar rail />
      <TabSlot />
    </Tabs>
  );
}

const Empty = () => null;

describe('NavBar rail', () => {
  it('shows no brand and puts "Torna alle app" last, after the tabs', async () => {
    await renderRouter({ _layout: RailLayout, index: Empty, search: Empty, favorites: Empty });

    expect(screen.queryByText('RADIO')).toBeNull();
    const controls = screen.getAllByRole(/^(tab|button)$/);
    expect(controls.map((c) => c.props.accessibilityLabel)).toEqual(['Scopri', 'Cerca', 'Preferiti', 'Torna alle app']);
  });
});
