import { fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';

import { LauncherButton } from '@/screens/shell/NavBar/LauncherButton';

describe('LauncherButton', () => {
  it('sends the app to background, as Back does on the main screen', async () => {
    const exitApp = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => {});
    await render(<LauncherButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Torna alle app' }));
    expect(exitApp).toHaveBeenCalledTimes(1);
  });
});
