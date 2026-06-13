"""Static mobile/layout guardrails for the browser game.

The goal is not pixel-perfect visual QA. It catches the regressions that have
hurt the game most often: tiny click targets, missing landscape support, hidden
overflow, and panels that cannot scroll on phones/tablets.
"""

from __future__ import annotations

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
JS = (ROOT / "www" / "index.js").read_text(encoding="utf-8")
CSS = (ROOT / "www" / "index.css").read_text(encoding="utf-8")
HTML = (ROOT / "www" / "index.html").read_text(encoding="utf-8")


REQUIRED = {
    "shared hitbox standard": [
        "normalizeClickableSurface",
        "hitbox-standard",
        "isInsideVisibleHitbox",
        "getMapTaskVisibleHitboxes",
        "button.hitbox-standard::after",
    ],
    "mobile landscape scroll": [
        "@media (orientation: landscape)",
        "overflow-y:auto",
        "height:auto",
        "100svh",
    ],
    "device zoom": [
        "deviceScreenZoomed",
        "toggleDeviceScreenZoom",
        "device-zoomed",
        "device-zoom-toggle",
    ],
    "live route map": [
        "buildLiveVoyageRouteMotionOverlay",
        "live-route-motion",
        "SOG",
        "TCPA",
    ],
    "cache bumped": [
        "index.js?v=104",
        "index.css?v=92",
    ],
    "4k dynamic background": [
        "__bgRenderScale",
        "__bgCanvasQuality",
        "4k-dpr",
        "getDynamicSceneTrafficOverlay",
        "scene-parallax-layer",
        "traffic-ship",
    ],
}


def main() -> int:
    blob = "\n".join([JS, CSS, HTML])
    missing: list[str] = []
    for group, needles in REQUIRED.items():
        for needle in needles:
            if needle not in blob:
                missing.append(f"{group}: {needle}")
    if missing:
        print("MOBILE_LAYOUT_QA_FAIL")
        for item in missing:
            print(f"- {item}")
        return 1
    print("MOBILE_LAYOUT_QA_OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
