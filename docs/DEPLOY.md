# Deploying to Vercel + Neon Postgres

The site is a standard Next.js app, so Vercel hosts it directly. Vercel does not
run a database, so the glossary lives in Neon — serverless Postgres with a free
tier that comfortably fits 5,062 entries.

Everything below is done once. Later updates are just `git push`.

---

## Step 1 — Put the project on GitHub

From the project root:

```bash
git init && git add -A && git commit -m "Glossary of Social Work in Tamil"
```

Create an empty repository on GitHub (no README, no .gitignore), then:

```bash
git remote add origin https://github.com/YOUR_NAME/tamil-glossary.git
git branch -M main && git push -u origin main
```

> The APK is excluded by `.gitignore`. `data/seed.sql` (11 MB) **is** committed —
> it is how the database gets rebuilt, and it is well under GitHub's limits.

---

## Step 2 — Create the database on Neon

1. Sign up at **https://neon.tech** (GitHub login works).
2. Create a project. Name it `tamil-glossary`.
3. Pick the region closest to your readers — **AWS ap-south-1 (Mumbai)** for
   Tamil Nadu.
4. On the project dashboard, open **Connect** and copy **two** connection
   strings:
   - **Pooled** (host contains `-pooler`) — this is what the website uses.
   - **Direct** (no `-pooler`) — use this for the one-off data import.

Both look like:

```
postgres://USER:PASSWORD@ep-xxxx.ap-south-1.aws.neon.tech/neondb?sslmode=require
```

> Treat these as passwords. Do not commit them or paste them into a chat or
> issue tracker.

---

## Step 3 — Load the glossary into Neon

From the project root, using the **direct** connection string:

```bash
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
export DIRECT_URL='PASTE_THE_DIRECT_CONNECTION_STRING_HERE'

psql "$DIRECT_URL" -f data/schema.sql
psql "$DIRECT_URL" -f data/seed.sql
```

The seed takes roughly a minute over the network. Check it landed:

```bash
psql "$DIRECT_URL" -c "SELECT count(*) FROM terms;"
```

Expect **5062**.

---

## Step 4 — Deploy on Vercel

1. Sign in at **https://vercel.com** with the same GitHub account.
2. **Add New → Project**, import the `tamil-glossary` repository.
3. **This is the setting people miss:** set **Root Directory** to `web`.
   The Next.js app lives in that subfolder, not at the repository root.
4. Framework preset should auto-detect as **Next.js**. Leave the build and
   output settings alone.
5. Add two **Environment Variables**, for Production, Preview and Development:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the **pooled** Neon string (host contains `-pooler`) |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` |

6. **Deploy.**

The first build takes two or three minutes. When it finishes, open the URL and
check that the home page shows *5,062 entries* — if it does, the app is talking
to Neon.

> The app connects with `prepare: false` and a pool of one, which is what makes
> the pooled Neon endpoint safe to use from serverless functions.

---

## Step 5 — Point the domain at it

In Vercel: **Project → Settings → Domains → Add**, enter `glossary.org.in`.

Vercel shows the DNS records to create at your registrar — usually an `A` record
for the apex domain and a `CNAME` for `www`. Add them, then wait for
propagation (minutes to a few hours). HTTPS is issued automatically.

Once the domain is live, update `NEXT_PUBLIC_SITE_URL` to
`https://glossary.org.in` and redeploy, so canonical links, the sitemap and
social previews use the real address.

---

## Step 6 — After the first deploy

- Visit `/sitemap.xml` — it should list about 5,071 URLs.
- Submit the site to **Google Search Console** with that sitemap.
- Check a term page's source for the `DefinedTerm` structured data block.

---

## Updating the site later

**Code changes** — commit and push; Vercel rebuilds automatically.

**Content changes** — the glossary is in the database, so edit it there. Until
the admin panel is built, use `psql`:

```bash
psql "$DIRECT_URL" -c "UPDATE terms SET ta_exp = '…' WHERE slug = 'empathy';"
```

Pages are cached for an hour (`revalidate = 3600`), so an edit appears within
the hour, or immediately after a redeploy.

---

## Costs

| | Free tier covers | When you would pay |
| --- | --- | --- |
| Vercel Hobby | personal, non-commercial sites | commercial use, or heavy traffic |
| Neon Free | 0.5 GB storage; this database is ~50 MB | far more traffic or storage |

---

## If something goes wrong

**Build fails with "DATABASE_URL is not set"** — the environment variable is
missing, or Root Directory is not set to `web`.

**Pages load but show no entries** — the connection string is right but the data
was never imported, or it went into a different Neon database than the one the
app points at. Re-run the count check in Step 3.

**"too many connections"** — the app is using the direct string. Switch
`DATABASE_URL` to the pooled one (`-pooler` in the host).

**Tamil text shows as boxes** — the font failed to load. Hard-refresh; the fonts
are self-hosted by Next.js and served from your own domain.
