// Generates index.json from sites/*.csv (ADR 0004 in ITVenture/rohrfinder).
//
// The slug rule mirrors the app's slugify() in app/src/storage/local.ts:
// lowercase, strip diacritics, collapse runs of non-[a-z0-9] to "-",
// trim dashes. The app never derives slugs itself; this index is the
// single source of truth for slug -> file.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SITES_DIR = "sites";
const INDEX = "index.json";
// Must stay identical to the app's validation of `file` (ADR 0004).
const FILE_PATTERN = /^sites\/[A-Za-z0-9._ -]+\.csv$/;

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function lastCommitDate(file) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      encoding: "utf8"
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

const files = existsSync(SITES_DIR)
  ? readdirSync(SITES_DIR)
      .filter((f) => /\.csv$/i.test(f))
      .sort((a, b) => a.localeCompare(b, "en"))
  : [];

const sites = [];
const seen = new Map();
let failed = false;
for (const f of files) {
  const file = `${SITES_DIR}/${f}`;
  if (!FILE_PATTERN.test(file)) {
    console.error(
      `${file}: file name may only contain letters, digits, space, dot, underscore and dash (no umlauts), and must end in .csv`
    );
    failed = true;
    continue;
  }
  const name = f.replace(/\.csv$/i, "");
  const slug = slugify(name);
  if (!slug) {
    console.error(`${file}: file name yields an empty slug`);
    failed = true;
    continue;
  }
  if (seen.has(slug)) {
    console.error(`${file}: slug "${slug}" is already used by ${seen.get(slug)}`);
    failed = true;
    continue;
  }
  seen.set(slug, file);
  sites.push({
    slug,
    name,
    file,
    updated: lastCommitDate(file) ?? new Date().toISOString()
  });
}
if (failed) process.exit(1);

const previous = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, "utf8")) : null;
if (previous && JSON.stringify(previous.sites) === JSON.stringify(sites)) {
  console.log(`${INDEX} unchanged (${sites.length} site(s))`);
  process.exit(0);
}
writeFileSync(INDEX, JSON.stringify({ generated: new Date().toISOString(), sites }, null, 2) + "\n");
console.log(`${INDEX} written with ${sites.length} site(s)`);
