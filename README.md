# PDIMW_20

Simple Vue 3 + TypeScript app for a personal data interaction project.

## Features

- Multiple pages with Vue Router
- Observable notebook embeds through reusable iframes
- Ready for deployment on GitHub Pages

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Add Observable visualizations

Open `src/data/visualizations.ts` and replace the example `src` with your own
Observable embed URL. Add more objects to the array when you want more iframe
visualizations on the page.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, open **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to the `main` branch and the workflow in `.github/workflows/deploy.yml`
   will build and publish the app.

If your repository name changes, update `repoName` in `vite.config.ts`.

## Export Garmin stress data

This project now includes a standalone Python exporter at
`scripts/export_garmin_stress.py`.

It is meant for Garmin Connect stress data that you want to reuse in JavaScript
tools such as Observable notebooks. The script:

- logs in with saved Garmin tokens or your email/password
- writes the raw Garmin API response to disk for inspection
- tries to normalize stress samples into timestamped rows
- exports JSON and/or CSV

### Install Python dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements-garmin.txt
```

### Export one day

```bash
export EMAIL="your-garmin-email"
export PASSWORD="your-garmin-password"
python3 scripts/export_garmin_stress.py --date 2026-04-24
```

### Export a date range

```bash
python3 scripts/export_garmin_stress.py --start 2026-04-01 --end 2026-04-07
```

When you export more than one day, the script now also creates one combined
range file in addition to the daily files.

Example for one month:

```bash
python3 scripts/export_garmin_stress.py --start 2025-04-01 --end 2025-04-30
```

This will also write combined files like:

- `garmin-stress-2025-04-01-to-2025-04-30-raw.json`
- `garmin-stress-2025-04-01-to-2025-04-30.json`
- `garmin-stress-2025-04-01-to-2025-04-30.csv`

You can also choose your own combined filename:

```bash
python3 scripts/export_garmin_stress.py \
  --start 2025-04-01 \
  --end 2025-04-30 \
  --combined-name garmin-stress-april-2025
```

### Output files

By default the script writes files to `exports/garmin/`:

- `garmin-stress-raw-YYYY-MM-DD.json`: raw Garmin response
- `garmin-stress-YYYY-MM-DD.json`: normalized rows for JavaScript
- `garmin-stress-YYYY-MM-DD.csv`: normalized rows for spreadsheets or Observable
- `garmin-stress-START-to-END-raw.json`: combined raw daily exports for a range

### Observable example

In Observable, the normalized JSON shape is designed to work directly:

```js
stress = FileAttachment("garmin-stress-2026-04-24.json").json()
```

or with CSV:

```js
stress = FileAttachment("garmin-stress-2026-04-24.csv").csv({typed: true})
```

### Notes

- The Garmin Connect Python library exposes Garmin stress endpoints, but Garmin
  can return different payload shapes depending on endpoint/account/device.
- Because of that, the script always saves the raw payload and then performs a
  best-effort normalization.
- If Garmin returns stress buckets without explicit timestamps, the script
  reconstructs timestamps evenly across the day and marks those rows with
  `derived_timestamp: true`.
