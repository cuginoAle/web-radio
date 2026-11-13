// Navigation is the boundary of the screens under test: it only records where the app wanted to go.
export const router = {
  push: jest.fn(),
  navigate: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};

// A rendered screen under test is the focused one.
export const useIsFocused = () => true;
