import { StyleSheet } from 'react-native';

const MAX_HEIGHT = 96;

export const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    maxHeight: MAX_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    opacity: 0.25, // text is read on top of the bars
  },
});
