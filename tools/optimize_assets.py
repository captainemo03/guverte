"""Lossless asset optimizer for PNG-heavy mobile builds.

No third-party dependency is required. The tool recompresses PNG IDAT streams at
zlib level 9, strips bulky non-critical metadata, and writes a manifest that the
pre-release QA can read.

Usage:
    python tools/optimize_assets.py --dry-run
    python tools/optimize_assets.py
"""

from __future__ import annotations

from pathlib import Path
import argparse
import json
import struct
import time
import zlib


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIRS = [ROOT / "www" / "assets", ROOT / "www" / "assets" / "bg"]
MANIFEST = ROOT / "tools" / "asset_optimization_manifest.json"


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
STRIP_ANCILLARY = {
    b"tEXt",
    b"zTXt",
    b"iTXt",
    b"tIME",
    b"pHYs",
    b"sRGB",
    b"gAMA",
    b"cHRM",
    b"iCCP",
}


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    return (
        struct.pack(">I", len(payload))
        + kind
        + payload
        + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
    )


def optimize_png_bytes(data: bytes) -> tuple[bytes, dict]:
    if not data.startswith(PNG_SIGNATURE):
        return data, {"optimized": False, "reason": "not_png"}

    pos = len(PNG_SIGNATURE)
    kept: list[tuple[bytes, bytes]] = []
    idat_parts: list[bytes] = []
    inserted_marker = False
    stripped = 0
    width = height = None

    while pos + 8 <= len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        kind = data[pos + 4 : pos + 8]
        payload = data[pos + 8 : pos + 8 + length]
        pos += 12 + length

        if kind == b"IHDR" and len(payload) >= 8:
            width, height = struct.unpack(">II", payload[:8])

        if kind == b"IDAT":
            idat_parts.append(payload)
            if not inserted_marker:
                kept.append((b"__IDAT__", b""))
                inserted_marker = True
        elif kind in STRIP_ANCILLARY:
            stripped += 1
        elif kind == b"IEND":
            break
        else:
            kept.append((kind, payload))

    if not idat_parts:
        return data, {"optimized": False, "reason": "no_idat"}

    raw = zlib.decompress(b"".join(idat_parts))
    recompressed = zlib.compress(raw, level=9)

    out = bytearray(PNG_SIGNATURE)
    for kind, payload in kept:
        if kind == b"IEND":
            continue
        if kind == b"__IDAT__":
            out += png_chunk(b"IDAT", recompressed)
        else:
            out += png_chunk(kind, payload)
    out += png_chunk(b"IEND", b"")

    new_data = bytes(out)
    return new_data, {
        "optimized": len(new_data) < len(data),
        "width": width,
        "height": height,
        "strippedChunks": stripped,
        "oldBytes": len(data),
        "newBytes": len(new_data),
        "savedBytes": max(0, len(data) - len(new_data)),
    }


def iter_pngs() -> list[Path]:
    seen: set[Path] = set()
    files: list[Path] = []
    for directory in ASSET_DIRS:
        if not directory.exists():
            continue
        for path in directory.rglob("*.png"):
            resolved = path.resolve()
            if resolved in seen:
                continue
            seen.add(resolved)
            files.append(path)
    return sorted(files)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Report savings without writing images.")
    parser.add_argument("--min-bytes", type=int, default=300_000, help="Only process PNGs at/above this size.")
    args = parser.parse_args()

    entries = []
    total_saved = 0
    processed = 0
    changed = 0

    for path in iter_pngs():
        old_size = path.stat().st_size
        if old_size < args.min_bytes:
            continue
        data = path.read_bytes()
        new_data, meta = optimize_png_bytes(data)
        processed += 1
        saved = meta.get("savedBytes", 0)
        if saved > 0:
            changed += 1
            total_saved += saved
            if not args.dry_run:
                path.write_bytes(new_data)
        entries.append(
            {
                "path": str(path.relative_to(ROOT)).replace("\\", "/"),
                "oldBytes": old_size,
                "newBytes": meta.get("newBytes", old_size),
                "savedBytes": saved,
                "width": meta.get("width"),
                "height": meta.get("height"),
                "changed": bool(saved > 0),
                "dryRun": args.dry_run,
            }
        )

    manifest = {
        "schema": "guverte.asset-optimization.v1",
        "generatedAt": int(time.time()),
        "dryRun": args.dry_run,
        "processed": processed,
        "changed": changed,
        "savedBytes": total_saved,
        "entries": entries,
    }
    if not args.dry_run:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"ASSET_OPTIMIZER processed={processed} changed={changed} savedKB={total_saved//1024} dryRun={args.dry_run}")
    if entries:
        for item in sorted(entries, key=lambda x: x["savedBytes"], reverse=True)[:12]:
            print(
                f"- {item['path']} {item['oldBytes']//1024}KB -> {item['newBytes']//1024}KB "
                f"saved={item['savedBytes']//1024}KB"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
