import { useWindowDimensions } from 'react-native';

const WIDE_MIN_WIDTH_DP = 900;
const WIDE_MIN_HEIGHT_DP = 600; // a large phone in landscape is wide enough but would hide the player controls

/** Three columns need landscape and room for enlarged text, so sizes are measured in scaled units. */
export function useIsWideLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  return width > height && width / fontScale >= WIDE_MIN_WIDTH_DP && height / fontScale >= WIDE_MIN_HEIGHT_DP;
}
