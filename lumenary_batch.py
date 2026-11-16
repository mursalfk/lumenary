#!/usr/bin/env python3
# lumenary_batch.py
# Runs one picture through every Lumenary treatment and saves the results on your computer.
# Stills are saved as PNG. Live (animated) treatments are saved as a PNG frame and a 6 second WebM clip.
#
#   python lumenary_batch.py path/to/photo.jpg
#   python lumenary_batch.py photo.jpg --out my-results --scale 2 --headed
#   python lumenary_batch.py photo.jpg --only ajrak,batik,glitch
#
# One time setup:  pip install playwright   then   playwright install chromium

import argparse
import re
import sys
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import TimeoutError as PWTimeout
from playwright.sync_api import sync_playwright

BASE = "https://lumenary-studio.vercel.app"


def get_slugs(base):
    """Every treatment page listed in the site's sitemap, in site order."""
    with urllib.request.urlopen(f"{base}/sitemap.xml", timeout=30) as r:
        xml = r.read().decode("utf-8", "replace")
    slugs = re.findall(r"<loc>[^<]*/style/([a-z0-9-]+)</loc>", xml)
    seen, out = set(), []
    for s in slugs:
        if s not in seen:
            seen.add(s)
            out.append(s)
    return out


def done_files(out_dir, idx, slug):
    return list(out_dir.glob(f"{idx:03d}-{slug}.*"))


def run_one(page, base, slug, image, out_dir, idx, scale, settle):
    """Returns (kind, files) where kind is 'still' or 'live'."""
    page.goto(f"{base}/style/{slug}", wait_until="domcontentloaded")
    save_btn = page.get_by_role("button", name="Save PNG")
    save_btn.wait_for(state="visible", timeout=60000)

    # Upload the picture into the hidden file input.
    page.locator('input[type="file"]').first.set_input_files(str(image))
    time.sleep(settle)

    rec_btn = page.get_by_role("button", name=re.compile(r"Record 6 s clip"))
    live = rec_btn.count() > 0
    files = []

    if not live and scale > 1:
        page.get_by_role("button", name=f"{scale}×").click()
        time.sleep(0.3)

    # PNG
    with page.expect_download(timeout=120000) as dl:
        save_btn.click()
    png = out_dir / f"{idx:03d}-{slug}.png"
    dl.value.save_as(str(png))
    files.append(png)

    # 6 second clip for live treatments
    if live:
        with page.expect_download(timeout=120000) as dl:
            rec_btn.click()
        webm = out_dir / f"{idx:03d}-{slug}.webm"
        dl.value.save_as(str(webm))
        files.append(webm)

    return ("live" if live else "still"), files


def main():
    ap = argparse.ArgumentParser(description="Run one picture through every Lumenary treatment.")
    ap.add_argument("image", help="path to your picture (JPG, PNG, WebP or GIF)")
    ap.add_argument("--out", default="lumenary-output", help="output folder (default: lumenary-output)")
    ap.add_argument("--base-url", default=BASE, help="site address (default: the live site)")
    ap.add_argument("--scale", type=int, choices=(1, 2, 3), default=1, help="PNG size for stills: 1, 2 or 3 (default 1)")
    ap.add_argument("--only", default="", help="comma separated treatment ids to run, e.g. ajrak,batik")
    ap.add_argument("--settle", type=float, default=1.5, help="seconds to wait after upload (default 1.5)")
    ap.add_argument("--headed", action="store_true", help="show the browser window")
    ap.add_argument("--no-resume", action="store_true", help="redo treatments that already have files")
    args = ap.parse_args()

    image = Path(args.image).expanduser().resolve()
    if not image.is_file():
        sys.exit(f"Picture not found: {image}")

    base = args.base_url.rstrip("/")
    slugs = get_slugs(base)
    if not slugs:
        sys.exit("Could not read the treatment list from the site.")
    numbered = list(enumerate(slugs, start=1))
    if args.only:
        want = {s.strip() for s in args.only.split(",") if s.strip()}
        numbered = [(i, s) for i, s in numbered if s in want]
        missing = want - {s for _, s in numbered}
        if missing:
            print(f"Not found: {', '.join(sorted(missing))}")

    out_dir = Path(args.out).expanduser().resolve() / image.stem
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"{len(numbered)} treatments. Saving to {out_dir}")

    failed, stills, lives = [], 0, 0
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not args.headed)
        ctx = browser.new_context(accept_downloads=True, viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        page.set_default_timeout(60000)
        for n, (idx, slug) in enumerate(numbered, start=1):
            if not args.no_resume and done_files(out_dir, idx, slug):
                print(f"[{n}/{len(numbered)}] {slug}: already done, skipping")
                continue
            t0 = time.time()
            try:
                kind, files = run_one(page, base, slug, image, out_dir, idx, args.scale, args.settle)
                stills += kind == "still"
                lives += kind == "live"
                print(f"[{n}/{len(numbered)}] {slug}: {kind}, {len(files)} file(s), {time.time() - t0:.1f}s")
            except (PWTimeout, Exception) as e:  # keep going after a failure
                failed.append(slug)
                print(f"[{n}/{len(numbered)}] {slug}: FAILED ({str(e).splitlines()[0][:120]})")
                try:
                    page = ctx.new_page()
                    page.set_default_timeout(60000)
                except Exception:
                    pass
        browser.close()

    print(f"\nDone. {stills} stills, {lives} live clips. Folder: {out_dir}")
    if failed:
        print("Failed (run again to retry only these):", ",".join(failed))


if __name__ == "__main__":
    main()