import { Alert } from 'react-native';

/** The one-time heads-up before the first download. Resolves true only on Continue (Cancel, back and outside-tap are all "no"). */
export const askInstallExplainer = () =>
  new Promise<boolean>((resolve) => {
    Alert.alert(
      'Allow installing updates',
      'Android will ask you to allow NoSpyFi to install apps. Turn it on once: NoSpyFi only uses it when you tap Install.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continue', onPress: () => resolve(true) },
      ],
      { onDismiss: () => resolve(false) },
    );
  });
