# rohrfinder-data

Published material lists for the [Rohr-Finder](https://github.com/ITVenture/rohrfinder)
app. One CSV per construction site under `sites/`; GitHub Pages serves
this branch as-is at `https://itventure.github.io/rohrfinder-data/`,
and the app reads `index.json` to list the sites and fetch a list at
`#/site/<slug>`. See ADR 0004 in the app repository for the design.

Everything here is public. Lists contain pipe codes, lengths,
materials and diameters only. Name the files neutrally: the file name
becomes a public URL and the site name shown in the app.

## Anleitung (Deutsch)

1. Oben rechts **Add file → Upload files** wählen.
2. Die CSV-Datei in den Ordner `sites/` ziehen. Der Dateiname ist der
   Name der Baustelle in der App, z. B. `Lindenpark-B3.csv`.
   Erlaubt sind Buchstaben, Ziffern, Leerzeichen, Punkt, Unterstrich
   und Bindestrich — keine Umlaute im Dateinamen.
3. Unten **Commit changes** klicken.
4. Nach etwa einer Minute erscheint die Baustelle in der App unter
   „Veröffentlichte Baustellen“. Auf dem Handy die App öffnen und die
   Baustelle antippen.

Eine Liste ersetzen: dieselbe Datei nochmals hochladen. Bereits
gesetzte Häkchen bleiben für Codes erhalten, die weiterhin in der
Liste stehen. Eine Baustelle entfernen: die Datei im Ordner `sites/`
löschen (Datei öffnen → Papierkorb-Symbol → Commit changes).

## CSV format

The same format the app's file picker accepts: no header, one pipe per
line, `code;length_mm;material;diameter`. Documented in
`docs/reference/csv-format.md` of the app repository.

## How the index works

`.github/workflows/build-index.yml` runs on every push that touches
`sites/` and regenerates `index.json` with `scripts/build-index.mjs`:

```json
{
  "generated": "2026-09-04T10:00:00.000Z",
  "sites": [
    { "slug": "demo-baustelle", "name": "Demo-Baustelle",
      "file": "sites/Demo-Baustelle.csv", "updated": "2026-09-04T09:58:12+02:00" }
  ]
}
```

The slug is the file name without `.csv`, lowercased, diacritics
stripped, runs of anything outside `a-z0-9` collapsed to `-`. Two files
that map to the same slug fail the workflow instead of publishing an
ambiguous index. Do not edit `index.json` by hand; the workflow
overwrites it.

`sites/Demo-Baustelle.csv` is a sample from the app's demo data. Delete
it once real sites exist.
