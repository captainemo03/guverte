"""Quick QA checks for the maritime training game.

This script is intentionally dependency-free so it can run on any local Python.
It checks that the live voyage, scene chain, glossary, and route-task pieces
that make the game feel active are still wired into the browser build.
"""

from __future__ import annotations

from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
INDEX_JS = ROOT / "www" / "index.js"
INDEX_HTML = ROOT / "www" / "index.html"


CHECKS = {
    "live voyage system": [
        "computeLiveVoyageState",
        "updateLiveVoyageState",
        "buildLiveVoyageTelemetryOverlay",
        "route-chip",
    ],
    "living scene flow": [
        "maybeTriggerLiveRoutineFlow",
        "scheduleDynamicMiniChain",
        "Gorev zinciri",
        "Canli gorev zinciri",
    ],
    "scene vhf console": [
        "getSceneVhfConsoleOverlay",
        "live-vhf-console",
        "VHF DSC RADIOTELEPHONE",
        "DISTRESS WATCH",
    ],
    "3d bridge layer": [
        "gfx-3d",
        "getScene3DBridgeOverlay",
        "renderThreeBridgeScene",
        "three-bridge-canvas",
        "three.module.js",
        "WebGLRenderer",
        "bridge3d-device",
        "bridge3d-vhf",
        "bridge3d-radar",
        "bridge3d-ecdis",
    ],
    "3d harbor storm events": [
        "bridge3d-tug",
        "bridge3d-berth-lights",
        "bridge3d-wave",
        "bridge3d-lightning",
        "harborObjects",
        "stormObjects",
        "tugOps",
    ],
    "route tasks": [
        "waypoint",
        "cpa",
        "ukc",
        "weatheravoid",
        "offshorezone",
    ],
    "premium ship vocabulary": [
        "Heavy-Lift Vessel",
        "Research Vessel",
        "Cable Laying Vessel",
        "Polar Code",
        "DP",
    ],
}


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8-sig")


def main() -> int:
    js = read_text(INDEX_JS)
    html = read_text(INDEX_HTML)
    missing: list[str] = []

    for group, needles in CHECKS.items():
        for needle in needles:
            if needle not in js and needle not in html:
                missing.append(f"{group}: {needle}")

    js_versions = re.findall(r"index\.js\?v=(\d+)", html)
    if not js_versions:
        missing.append("cache: index.js version query is missing")
    elif int(js_versions[-1]) < 80:
        missing.append(f"cache: index.js version is stale ({js_versions[-1]})")

    css_versions = re.findall(r"index\.css\?v=(\d+)", html)
    if not css_versions:
        missing.append("cache: index.css version query is missing")
    elif int(css_versions[-1]) < 74:
        missing.append(f"cache: index.css version is stale ({css_versions[-1]})")

    if not (ROOT / "www" / "vendor" / "three.module.js").exists():
        missing.append("3d bridge layer: vendor/three.module.js is missing")

    timer_hooks = js.count("sceneLiveSequenceTimers.push")
    if timer_hooks < 5:
        missing.append(f"live timers: expected rich timed scene hooks, found {timer_hooks}")

    if missing:
        print("LIVELINESS_QA_FAIL")
        for item in missing:
            print(f"- {item}")
        return 1

    print("LIVELINESS_QA_OK")
    print(f"- checked {INDEX_JS.relative_to(ROOT)}")
    print(f"- checked {INDEX_HTML.relative_to(ROOT)}")
    print(f"- scene timer hooks: {timer_hooks}")
    print(f"- index.js cache version: {js_versions[-1]}")
    print(f"- index.css cache version: {css_versions[-1]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
