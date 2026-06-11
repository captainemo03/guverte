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
        "Yaklastin",
        "mapTaskWrongAttempts",
        "Uc uzak denemeden sonra",
        "applyEffect({bilgi:-1}",
    ],
    "character creator reliability": [
        "syncPlayerModelFromTraits",
        "resolvePlayerModelFromTraits",
        "creator-hair",
        "creator-beard",
        "creator-face",
        "renderPortraitTargets",
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
    "multi language support": [
        "GAME_LANGUAGES",
        "setGameLanguage",
        "translateGameText",
        "getLocalizedSceneNarrative",
        "localizeChoiceText",
        "LOCALIZE_EXACTS",
        "localizeStaticDom",
        "staticTextSource",
        "scene.brief",
        "getChoiceTagLabel",
        "intro-language-select",
        "language-select",
        "gameLanguage",
        "English",
        "Espanol",
        "Deutsch",
        "Francais",
        "中文",
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
    android_billing = read_text(ANDROID_BILLING) if ANDROID_BILLING.exists() else ""
    android_main = read_text(ANDROID_MAIN) if ANDROID_MAIN.exists() else ""
    android_gradle = read_text(ANDROID_GRADLE) if ANDROID_GRADLE.exists() else ""
    android_manifest = read_text(ANDROID_MANIFEST) if ANDROID_MANIFEST.exists() else ""
    all_text = "\n".join([js, html, android_billing, android_main, android_gradle, android_manifest])
    missing: list[str] = []

    for group, needles in CHECKS.items():
        for needle in needles:
            if needle not in all_text:
                missing.append(f"{group}: {needle}")

    js_versions = re.findall(r"index\.js\?v=(\d+)", html)
    if not js_versions:
        missing.append("cache: index.js version query is missing")
    elif int(js_versions[-1]) < 92:
        missing.append(f"cache: index.js version is stale ({js_versions[-1]})")

    css_versions = re.findall(r"index\.css\?v=(\d+)", html)
    if not css_versions:
        missing.append("cache: index.css version query is missing")
    elif int(css_versions[-1]) < 82:
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
