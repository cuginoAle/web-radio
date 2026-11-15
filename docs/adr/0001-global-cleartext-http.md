# Cleartext HTTP traffic enabled globally

The audio spike (`docs/spike-audio.md`) confirmed that, on a release build, Android blocks `http://` streams ("CLEARTEXT communication … not permitted by network security policy"). 34% of the catalogue's 1,400 most listened-to stations use an HTTP URL, on arbitrary hosts that cannot be listed in advance.

We therefore enabled `android.usesCleartextTraffic` through `expo-build-properties`, with the explicit approval required by the handover (§7). Expo offers no exception for arbitrary hosts other than a global one.

## Consequences

- HTTP streams and favicons can be read or tampered with on the network. The app only plays audio and loads images and sends no personal data, so the risk is limited to the content received.
- Calls to the Radio Browser directory always stay on HTTPS: the client does not accept `http://` mirrors.
- HTTP URLs are not automatically converted to HTTPS.
