# The Android app

The phone edition of the glossary, packaged for the Play Store. All 5,062
entries ship inside the APK, so the app opens and searches with no network at
all — the same way the original edition worked.

```
mobile/
├── src/
│   ├── app.tsx        screen switch: Home, Index, Meaning, Recent, About, Contact
│   ├── router.tsx     the in-memory router (no server, so no URLs to fetch)
│   ├── shims/         next/link and next/navigation, aliased onto that router
│   └── glossary.ts    the bundled dataset, plus where updates would be stored
├── public/dataset/    generated — 5,062 entries, sharded by initial
├── www/               generated — what Capacitor packages
└── android/           the Gradle project
```

## Why the screens are not in this directory

Every screen is imported from `../web/components/app`. The website's phone view
and the app render the *same components*; only the data source differs — the
website reads Postgres on the server, the app reads the bundled dataset in the
browser. Fixing a screen fixes it in both.

`next/link` and `next/navigation` are aliased in `vite.config.ts` onto the
app's own router, which is what lets those components compile outside Next
without a single change.

## Building

Prerequisites: the Postgres database loaded (see the root README), the Android
SDK, and a **JDK 17 or 21** — the Android Gradle Plugin rejects anything newer.

```bash
brew install openjdk@21          # if you do not have one
cd mobile
npm install
npm run apk                      # dataset → web build → cap sync → assembleRelease
```

`scripts/gradle.sh` finds a supported JDK itself, so a newer `java` on your
PATH does not matter.

| Command | Output |
| --- | --- |
| `npm run dev` | the app in a browser, hot-reloading |
| `npm run build` | `www/` — exactly what goes in the APK |
| `npm run apk:debug` | `android/app/build/outputs/apk/debug/app-debug.apk` |
| `npm run apk` | `…/apk/release/app-release.apk` |
| `npm run aab` | `…/bundle/release/app-release.aab` — the Play Store upload |

## Signing

Without a keystore the release build is produced **unsigned**, which cannot be
installed or uploaded. Create an upload key once:

```bash
keytool -genkeypair -v -keystore ~/glossary-upload-key.jks \
  -alias glossary-upload -keyalg RSA -keysize 2048 -validity 10000
```

Then copy `android/keystore.properties.example` to
`android/keystore.properties` and fill in the four values. Both the `.jks` and
the properties file are gitignored.

Back the keystore up somewhere you will still have it in five years. Google
cannot reissue an upload key; losing it means losing the ability to update the
listing.

## Publishing

1. `npm run aab`
2. Play Console → Create app → upload `app-release.aab`
3. Data safety: the app collects nothing and sends nothing. Answer "No" to data
   collection and sharing.
4. Content rating: educational reference, no user-generated content.
5. The version lives in `android/app/build.gradle` — raise `versionCode` by one
   for every upload, and set `versionName` to match `APP_VERSION` in
   `../web/lib/app-meta.ts`, which is what the drawer shows.

The app is not a webview wrapper around a website: it carries its own content
and works offline, which is what Play's minimum-functionality policy asks for.

## Updating the glossary without shipping an APK

`scripts/build-dataset.mjs` writes a `manifest.json` carrying a hash per shard.
`Glossary.sync(origin)` in `../web/lib/dataset/source.ts` compares the device's
manifest against a server's and downloads only the shards whose hash changed —
a typo fix in one entry costs one shard, not 11 MB. Downloaded files land in
the device's data directory and are read in preference to the bundled ones;
`resetToBundled()` throws them away.

Nothing calls `sync()` in the shipped app, and `VITE_UPDATE_ORIGIN` is unset,
so it never touches the network. An admin build turns it on by setting that
variable and calling `sync()` behind whatever login it needs. The server side
is just the output of `npm run dataset` served as static files — the website
already publishes it at `/dataset`.
