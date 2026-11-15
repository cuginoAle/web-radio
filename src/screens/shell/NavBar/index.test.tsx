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
  it('shows no brand and puts "Back to apps" last, after the tabs', async () => {
    await renderRouter({ _layout: RailLayout, index: Empty, search: Empty, favorites: Empty });

    expect(screen.queryByText('RADIO')).toBeNull();
    const controls = screen.getAllByRole(/^(tab|button)$/);
    expect(controls.map((c) => c.props.accessibilityLabel)).toEqual(['Discover', 'Search', 'Favourites', 'Back to apps']);
  });
});

describe.each([true, false])('NavBar tabs (rail: %s)', (rail) => {
  function Layout() {
    return (
      <Tabs>
        <TabList>
          <TabTrigger name="discover" href="/" />
          <TabTrigger name="search" href="/search" />
          <TabTrigger name="favorites" href="/favorites" />
        </TabList>
        <NavBar rail={rail} />
        <TabSlot />
      </Tabs>
    );
  }

  it('shows icons only, keeping the names for screen readers', async () => {
    await renderRouter({ _layout: Layout, index: Empty, search: Empty, favorites: Empty });

    for (const name of ['Discover', 'Search', 'Favourites']) {
      expect(screen.getByRole('tab', { name })).toBeTruthy();
      expect(screen.queryByText(name)).toBeNull();
    }
  });
});
