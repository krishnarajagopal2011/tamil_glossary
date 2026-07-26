# Glossary of Social Work in Tamil

**சமூகப்பணி கலைச்சொல் அகராதி** — a bilingual English–Tamil glossary of 5,062
social work terms, written by S. Rengasamy.

The text was recovered from the only surviving copy of the original Android
application and rebuilt as a Next.js + PostgreSQL website.

```
├── web/                     Next.js 16 app (the website)
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

## Deploying

See [docs/DEPLOY.md](docs/DEPLOY.md).

## Credit

Glossary content © S. Rengasamy. The author credit is preserved throughout the
site.
