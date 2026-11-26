# Android app (Trusted Web Activity)

The Play Store app is a thin wrapper (TWA) around `https://www.eslamosama.com/sos/`.
Update the web page and the app updates too. No app release is needed for content changes.

- Package: `com.eslamosama.sos`
- Built with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) from `twa-manifest.json`.
- No extra Android permissions. Calls open the dialer, location is asked by the page itself.

## Build

```
npm i -g @bubblewrap/cli
cd android
bubblewrap build
```

Output: `app-release-bundle.aab` (upload to Play) and `app-release-signed.apk` (install on a phone to test).

The signing keystore (`egypt-sos-upload.keystore`) is **never** committed. It's ignored by `.gitignore`.

## Digital Asset Links

For the app to open full screen (no browser bar), the site must serve
`https://www.eslamosama.com/.well-known/assetlinks.json` built from `assetlinks.template.json`:

- `UPLOAD_KEY_SHA256`: `keytool -list -v -keystore egypt-sos-upload.keystore -alias upload`
- `PLAY_APP_SIGNING_KEY_SHA256`: Play Console → the app → Test and release → App integrity → App signing.
