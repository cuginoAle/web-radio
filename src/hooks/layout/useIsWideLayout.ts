import { useWindowDimensions } from 'react-native';

/** Any landscape window gets three columns: car boxes are short and low-density, so size thresholds kept them on the phone layout. */
export function useIsWideLayout() {
  const { width, height } = useWindowDimensions();
  return width > height;
}
