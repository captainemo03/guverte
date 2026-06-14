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
        "pointer-events:none",
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
        "index.js?v=120",
        "index.css?v=109",
    ],
    "4k dynamic background": [
        "__bgRenderScale",
        "__bgCanvasQuality",
        "4k-dpr",
        "getDynamicSceneTrafficOverlay",
        "scene-parallax-layer",
        "traffic-ship",
    ],
    "4k visual polish": [
        "getScene4KOverlay",
        "live-4k-grade",
        "live-4k-ecdis-grid",
        "live-4k-stormglass",
        "phoneGlass4K",
        "premiumCard4K",
    ],
    "4k shodb chart maps": [
        "buildShodbChartIndexOverlay",
        "buildWorldShodbChartIndexOverlay",
        "chart-index-sheet-layer",
        "shodb-style",
        "MARMARA DENIZI",
    ],
    "advanced map chain ui": [
        "map-chain-panel",
        "ecdis-control-overlay",
        "buildEcdisChartControlOverlay",
        "runMapTaskReplay",
        "getClickedWorldChartIndexSheet",
    ],
    "intro menu pages": [
        "home-screen",
        "home-page-play",
        "home-page-options",
        "home-page-premium",
        "setAppScreen",
        "openSetupScreen",
        "openGameScreen",
        "intro-menu-shell",
        "intro-menu-tabs",
        "intro-page-play",
        "intro-page-options",
        "intro-page-premium",
        "setIntroMenuPage",
        "intro-premium-card",
        "intro-audio-card",
        "sound-option-btn",
    ],
    "intro route selector": [
        "route-select-grid",
        "route-card",
        "renderVoyageRouteSelector",
        "setSelectedVoyageRoute",
        "MAJOR_TRADE_ROUTE_KEYS",
    ],
    "setup ship selection tab": [
        "data-intro-tab=\"ship\"",
        "openShipSelectScreen",
        "ensureShipSelectScreen",
        "ship-choice-summary",
        "ship-tab-card",
        "renderShipChoiceSummary",
        "introMenuPage === 'ship'",
    ],
    "cinema exit and ad removal": [
        "cinema-exit-btn",
        "toggleCinemaMode(false)",
        "ADS_REMOVAL_PRODUCT_ID",
        "ADS_REMOVAL_PRICE_LABEL",
        "openAdsRemovalPurchase",
        "restoreAdsRemovalPurchase",
        "adsRemoved",
    ],
    "clean gameplay ui": [
        "stats-summary",
        "toggleStatsExpanded",
        "more-tools-panel",
        "toggleMoreTools",
        "cinema-mode",
        "toggleCinemaMode",
        "primary-tool",
    ],
    "mobile creator portrait fit": [
        "creator-mobile-portrait-fit",
        ".creator-preview-stage .portrait-composite.preview",
        "width:min(62vw,230px)",
        "scale(.86)",
    ],
    "ultra 4k expansion": [
        "ULTRA_4K_ROUTE_EXPANSION",
        "live-4k-bridge-reflection",
        "live-4k-port-haze",
        "live-4k-wave-burst",
        "traffic-research",
        "traffic-roro",
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
