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
        "index.js?v=148",
        "index.css?v=130",
    ],
    "creator color controls removed": [
        "creator-uniform",
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
    "expanded map workspace": [
        "#map-box{background:var(--navy2);border:1px solid var(--border);border-radius:12px;width:min(1900px,calc(100vw - 16px));height:calc(100dvh - 16px);max-height:calc(100dvh - 16px);padding:12px;position:relative;overflow:auto;",
        "overscroll-behavior:contain",
        "#map-world-view{display:flex;flex:1 1 auto;min-height:0;flex-direction:column;}",
        "#map-svg{width:100%;height:min(760px,calc(100dvh - 138px));",
        "#port-chart-svg{width:100%;height:min(720px,calc(100dvh - 280px));",
        "touch-action:pan-y pinch-zoom",
        "#map-files{border:1px solid var(--border2);border-radius:8px;background:rgba(7,19,36,0.55);padding:10px;max-height:none;",
    ],
    "political world atlas": [
        "political-atlas",
        "world-country",
        "world-country-line",
        "atlas-label",
        "country-label",
        "worldSeaGrad",
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
    "new voyage route pack": [
        "ADDITIONAL_NAVIGATION_ROUTES",
        "us_pnw_asia_grain",
        "australia_japan_lng",
        "gulf_europe_crude_cape",
        "blacksea_india_bulk",
        "north_europe_canada_stlawrence",
        "asia_australia_container",
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
        "width:min(48vw,190px)",
        "scale(.74)",
    ],
    "mobile fit overhaul": [
        "mobile-fit-overhaul",
        "body.screen-game{height:100dvh;overflow:hidden;}",
        "#story{flex:1 1 auto;min-height:0;overflow:auto;",
        "#choices{flex:0 0 auto;display:grid;grid-template-columns:1fr;",
        "mobile-landscape-fit",
        "body.screen-game{height:100svh;overflow:hidden;}",
        "#map-box,#devices-box,#notes-box,#journal-box,#colreg-box",
    ],
    "ultra 4k expansion": [
        "ULTRA_4K_ROUTE_EXPANSION",
        "live-4k-bridge-reflection",
        "live-4k-port-haze",
        "live-4k-wave-burst",
        "traffic-research",
        "traffic-roro",
    ],
    "cinematic scene pack": [
        "CINEMATIC_SCENES",
        "injectCinematicScenes",
        "getCinematicOverlay",
        "setupCinematicSceneFlow",
        "scene-cinematic-",
        "cinematic-shot",
        "cinematic-beat-strip",
        "cinematic-text-flow",
        "cinematic-controls",
        "cinematic-props",
        "cin-prop pilot-boat",
    ],
}


def main() -> int:
    blob = "\n".join([JS, CSS, HTML])
    missing: list[str] = []
    for group, needles in REQUIRED.items():
        for needle in needles:
            if needle not in blob:
                missing.append(f"{group}: {needle}")
    removed_creator_controls = [
        "id=\"creator-haircolor\"",
        "id=\"creator-eye\"",
        "renderCreatorRow('creator-haircolor'",
        "renderCreatorRow('creator-eye'",
    ]
    for needle in removed_creator_controls:
        if needle in blob:
            missing.append(f"creator color controls removed: unexpected {needle}")
    if missing:
        print("MOBILE_LAYOUT_QA_FAIL")
        for item in missing:
            print(f"- {item}")
        return 1
    print("MOBILE_LAYOUT_QA_OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
