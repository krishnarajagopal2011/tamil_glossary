# Glossary of Social Work in Tamil

**சமூகப்பணி கலைச்சொல் அகராதி** — a bilingual English–Tamil glossary of 5,062
social work terms, written by S. Rengasamy.

The text was recovered from the only surviving copy of the original Android
application and rebuilt as a Next.js + PostgreSQL website.

The website carries two views of itself: the editorial design from tablet width
up, and — on a phone — the blue tabbed app the glossary was first published as.
The Android edition is built from those same screens.

```
├── web/                     Next.js 16 app (the website)
├── mobile/                  the Android app — see mobile/README.md
├── data/
│   ├── glossary_recovered.sqlite   Decrypted database from the APK
│   ├── schema.sql                  PostgreSQL schema
│   └── seed.sql                    5,062 terms, 5 categories, 14,101 figure records
├── scripts/
│   ├── 01_decrypt_apk_db.py        SQLCipher 3 decryption of assets/swg_tmd
│   └── 02_export_postgres.py       SQLite → PostgreSQL seed generator
└── docs/DEPLOY.md           Step-by-step Vercel + Neon deployment
```

## Running it locally

**1. PostgreSQL**

```bash
brew install postgresql@17 && brew services start postgresql@17
```

**2. Create and load the database**

```bash
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
createdb tamil_glossary
psql -d tamil_glossary -f data/schema.sql
psql -d tamil_glossary -f data/seed.sql
```

**3. Configure and start the site**

```bash
cd web
cp .env.example .env.local   # set DATABASE_URL to postgres://$(whoami)@localhost:5432/tamil_glossary
npm install
npm run dev
```

The site runs at http://localhost:3000.

## Regenerating the data

`data/seed.sql` is generated, not hand-edited. To rebuild it from the recovered
SQLite file:

```bash
python3 scripts/02_export_postgres.py
```

To repeat the decryption from the original APK, unzip the installer and run
`scripts/01_decrypt_apk_db.py` against `assets/swg_tmd`. All 12,927 database
pages verify against their HMACs, which is what proves the recovery is complete.

## The Android app

```bash
cd mobile
npm install
npm run apk
```

All 5,062 entries are packaged inside the APK, so it opens and searches with no
network. The build, signing and Play Store steps are in
[mobile/README.md](mobile/README.md).

## Deploying

Live at **https://tamil-glossary.vercel.app**, served from Neon.

```bash
cd web
vercel deploy --prod
```

`NEXT_PUBLIC_SITE_URL` and `DATABASE_URL` are already set on the Vercel
project. The build regenerates `public/dataset` from Postgres, which is both
what the app would fetch updates from and what keeps the two in step.

Shared links from the app point at `PUBLIC_SITE_URL` in
[web/lib/app-meta.ts](web/lib/app-meta.ts) — compiled into the APK, so
changing it means a new release. See also [docs/DEPLOY.md](docs/DEPLOY.md) for
attaching glossary.org.in.

## Credit and licence

The glossary — every headword, Tamil equivalent and explanation — is
© Prof. S. Rengasamy, Retired Professor of Social Work, and is released for
free non-commercial use under CC BY-NC 4.0. Any citation or derivative must
credit him. The software is MIT. See [LICENSE](LICENSE).

Special thanks to Shekar, Ekalai Software Solutions, who built the original
Android edition.
