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
INDEX_CSS = ROOT / "www" / "index.css"
ANDROID_BILLING = ROOT / "android" / "app" / "src" / "main" / "java" / "com" / "captainemo" / "guverte" / "GuverteBillingBridge.java"
ANDROID_MAIN = ROOT / "android" / "app" / "src" / "main" / "java" / "com" / "captainemo" / "guverte" / "MainActivity.java"
ANDROID_GRADLE = ROOT / "android" / "app" / "build.gradle"
ANDROID_MANIFEST = ROOT / "android" / "app" / "src" / "main" / "AndroidManifest.xml"


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
    "3d training scene modules": [
        "getScene3DFeatureFlags",
        "bridge3d-ecr",
        "bridge3d-mooring-deck",
        "bridge3d-survival-station",
        "bridge3d-fire-room",
        "bridge3d-route-table",
        "bridge3d-manifold-panel",
        "bridge3d-premium-ops",
        "bridge3d-starlink",
        "bridge3d-helicopter",
        "bridge3d-cargo-lift",
        "satBeam",
        "live-starlink-dish",
        "trainingObjects",
    ],
    "route tasks": [
        "waypoint",
        "cpa",
        "ukc",
        "weatheravoid",
        "offshorezone",
    ],
    "premium ship vocabulary": [
        "PREMIUM_PRODUCT_ID",
        "premium_full_pack",
        "PREMIUM_PRICE_LABEL",
        "75 TL",
        "getPremiumBillingBridge",
        "restorePremiumPurchase",
        "Heavy-Lift Vessel",
        "Research Vessel",
        "Cable Laying Vessel",
        "Polar Code",
        "DP",
    ],
    "android premium billing bridge": [
        "GuverteBillingNative",
        "purchasePremium",
        "restorePremium",
        "premium_full_pack",
        "com.android.vending.BILLING",
    ],
    "complexity and save flow": [
        "PLAY_MODE_DEFS",
        "renderPlayModeSelector",
        "getFeatureUnlocks",
        "updateGuidanceStrip",
        "guidance-strip",
        "toggleSavePanel",
        "save-panel-grid",
        "gameplayMode",
    ],
    "mission director and training": [
        "mission-director",
        "getMissionDirectorPlan",
        "completeMissionFromChoice",
        "completeMissionFromFeature",
        "vhf-practice-console",
        "PREMIUM_PACKAGE_CATALOG",
    ],
    "map realism and gentle penalties": [
        "buildEnhancedEncDetailOverlay",
        "enc-enhanced-detail",
        "NO-GO / SHALLOW WATER",
        "SAFETY DEPTH",
        "getMapTaskTargetLabelBox",
        "getMapTaskVisibleHitboxes",
        "isInsideVisibleHitbox",
        "normalizeClickableSurface",
        "isInsideMapTaskTargetLabel",
        "labelHit",
        "Yaklastin",
        "mapTaskWrongAttempts",
        "Uc uzak denemeden sonra",
        "applyEffect({bilgi:-1}",
        "completedMapTasks:Array.from",
        "selectedPortChart = data.selectedPortChart",
    ],
    "world atlas zoom map": [
        "WORLD_MAP_FEATURES",
        "WORLD_MAP_POINT_LOOKUP",
        "buildWorldAtlasBaseLayer",
        "buildWorldMapFeatureLayer",
        "adjustWorldMapZoom",
        "resetWorldMapView",
        "initWorldMapInteractions",
        "world-map-controls",
        "Bosporus",
        "Suez Canal",
        "Panama Canal",
        "Malacca Strait",
        "North Atlantic Ocean",
    ],
    "character creator reliability": [
        "syncPlayerModelFromTraits",
        "resolvePlayerModelFromTraits",
        "creator-hair",
        "creator-beard",
        "creator-face",
        "renderPortraitTargets",
        "PORTRAIT_SHEET_ASSETS",
        "support-style-female-cutout.png",
        "__portraitVersion:2",
        "sheetUpgradeMap",
    ],
    "mobile landscape support": [
        "MOBIL / TABLET YATAY OYUN MODU",
        "@media (orientation: landscape)",
        "height:100svh",
        "#choices{flex:0 0 auto;display:grid",
        "#creator-wrap{grid-template-columns:minmax(150px,31vw)",
    ],
    "simulation flow pack": [
        "MAP_TASK_TRAINING",
        "getMapTrainingCards",
        "getDifficultyProfileCard",
        "getCaptainReviewPreview",
        "getErrorChainPreview",
        "createCaptainReviewNow",
        "sim-training-grid",
        "monthlyCaptainReviewState",
    ],
    "passage operations pack": [
        "getPassagePlanCard",
        "getBridgeTeamRolePanel",
        "getSmcpPracticePanel",
        "getTugMooringPanel",
        "getEngineControlRoomPanel",
        "getCargoControlPanel",
        "getAccidentReplayPanel",
        "getPersonalNotebookPanel",
        "getPassageDebriefPanel",
        "personalNotebookEntries",
        "passageDebriefState",
    ],
    "charter mini mode": [
        "CHARTER_CASES",
        "charterTradeState",
        "renderCharterMiniMode",
        "submitCharterMiniMode",
        "Laytime baslangicini sec",
        "SOF saatlerini oku",
        "sim-charter-panel",
        "premium-sim-panel",
    ],
    "document and career integration": [
        "DOCUMENT_TRAINING_FORMS",
        "documentTrainingState",
        "renderDocumentPracticePanel",
        "submitDocumentPracticeForm",
        "renderTrainingRoadmapPanel",
        "queueCharterOrDocumentFollowup",
        "maybeTriggerVoyageInterrupt",
        "applyStrictCrewMemory",
        "renderContractCinematicReport",
        "document-practice-panel",
        "training-roadmap",
        "premium-preview-strip",
    ],
    "interactive simulator polish": [
        "deviceScreenZoomed",
        "toggleDeviceScreenZoom",
        "device-zoomed",
        "device-zoom-toggle",
        "buildLiveVoyageRouteMotionOverlay",
        "live-route-motion",
        "triggerDecisionReplayAndOfficerFeedback",
        "VHF call: pilot station ETA",
        "Pilot ladder ready",
        "MPX: draft",
        "premium-preview-card",
        "premiumPreviewMove",
    ],
    "multi language support": [
        "GAME_LANGUAGES",
        "setGameLanguage",
        "translateGameText",
        "getLocalizedSceneNarrative",
        "localizeChoiceText",
        "LOCALIZE_EXACTS",
        "localizeStaticDom",
        "initLanguageMutationObserver",
        "rerenderLanguageSensitivePanels",
        "LOCALIZE_COMMON_EXACTS",
        "staticTextSource",
        "scene.brief",
        "scene.cue",
        "getLocalizedSpeakerLine",
        "getLocalizedSceneLocation",
        "getLocalizedScenarioCue",
        "getChoiceTagLabel",
        "getLocalizedLongTextFallback",
        "intro-language-select",
        "language-select",
        "gameLanguage",
        "English",
        "Espanol",
        "Deutsch",
        "Francais",
        "Русский",
        "I18N.ru",
        "LOCALIZE_EXACTS.ru",
        "LOCALIZE_COMMON_EXACTS.ru",
        "DYNAMIC_TRANSLATIONS",
        "中文",
    ],
    "starlink maritime pack": [
        "Starlink Maritime Terminal",
        "starlinkStatus",
        "Starlink Maritime Baglanti Pratigi",
        "OBSTRUCTION MAP",
        "FAILOVER VSAT",
        "starlink.ship/status",
        "STARLINK / UYDU INTERNET",
        "Starlink Maritime",
        "Crew Wi-Fi",
        "Ops VLAN",
    ],
    "charter laytime notes": [
        "CHARTER / LAYTIME / NOR",
        "Laycan",
        "NOR Tendered",
        "NOR Accepted",
        "Laytime Statement",
        "Demurrage",
        "Despatch",
        "Notice Time",
        "WIBON",
        "WIPON",
        "WCCON",
        "Weather Working Day",
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
    css = read_text(INDEX_CSS)
    android_billing = read_text(ANDROID_BILLING) if ANDROID_BILLING.exists() else ""
    android_main = read_text(ANDROID_MAIN) if ANDROID_MAIN.exists() else ""
    android_gradle = read_text(ANDROID_GRADLE) if ANDROID_GRADLE.exists() else ""
    android_manifest = read_text(ANDROID_MANIFEST) if ANDROID_MANIFEST.exists() else ""
    all_text = "\n".join([js, html, css, android_billing, android_main, android_gradle, android_manifest])
    missing: list[str] = []

    for group, needles in CHECKS.items():
        for needle in needles:
            if needle not in all_text:
                missing.append(f"{group}: {needle}")

    handler_sources = re.findall(r'on\w+="([^"]+)"', html)
    handler_calls: set[str] = set()
    ignored_handler_names = {
        "if",
        "for",
        "while",
        "switch",
        "return",
        "Math",
        "Number",
        "String",
        "Array",
    }
    for source in handler_sources:
        for name in re.findall(r"\b([A-Za-z_$][\w$]*)\s*\(", source):
            if name not in ignored_handler_names:
                handler_calls.add(name)

    for name in sorted(handler_calls):
        defined = re.search(
            rf"(?:function\s+{re.escape(name)}\s*\(|(?:const|let|var)\s+{re.escape(name)}\s*=|window\.{re.escape(name)}\s*=)",
            js,
        )
        if not defined:
            missing.append(f"html handler: {name} is not defined in index.js")

    asset_refs = set()
    for match in re.findall(r"(?:src|href)=[\"']\.\/([^\"'#?]+)", html):
        asset_refs.add(match)
    for match in re.findall(r"['\"]((?:assets|vendor|bg)/[^'\"?#)]+)['\"]", all_text):
        asset_refs.add(match)
    for ref in sorted(asset_refs):
        if ref.startswith(("index.", "#")):
            continue
        if not (ROOT / "www" / ref).exists():
            missing.append(f"asset: missing www/{ref}")

    js_versions = re.findall(r"index\.js\?v=(\d+)", html)
    if not js_versions:
        missing.append("cache: index.js version query is missing")
    elif int(js_versions[-1]) < 103:
        missing.append(f"cache: index.js version is stale ({js_versions[-1]})")

    css_versions = re.findall(r"index\.css\?v=(\d+)", html)
    if not css_versions:
        missing.append("cache: index.css version query is missing")
    elif int(css_versions[-1]) < 91:
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
