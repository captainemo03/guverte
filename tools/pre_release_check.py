"""Pre-release QA bundle for the maritime browser game.

This is a dependency-free Python guardrail. It catches the regressions that
usually hurt the game before a mobile/Play Store build: half-wired languages,
wrong crew gender portraits, tiny/click-broken chart targets, billing product
ID drift, suspicious scene text, and asset bloat.
"""

from __future__ import annotations

from pathlib import Path
import re
import struct
import sys
import json
import zlib


ROOT = Path(__file__).resolve().parents[1]
WWW = ROOT / "www"
TOOLS = ROOT / "tools"
ASSETS = WWW / "assets"
VENDOR = WWW / "vendor"
ASSET_OPTIMIZATION_MANIFEST = TOOLS / "asset_optimization_manifest.json"

INDEX_JS = WWW / "index.js"
INDEX_CSS = WWW / "index.css"
INDEX_HTML = WWW / "index.html"
FIRST_PERSON_JS = WWW / "first-person-world.js"
FIRST_PERSON_CSS = WWW / "first-person-world.css"
PACKAGE_JSON = ROOT / "package.json"
ANDROID_BILLING = (
    ROOT
    / "android"
    / "app"
    / "src"
    / "main"
    / "java"
    / "com"
    / "captainemo"
    / "guverte"
    / "GuverteBillingBridge.java"
)
ANDROID_MANIFEST = ROOT / "android" / "app" / "src" / "main" / "AndroidManifest.xml"


JS = INDEX_JS.read_text(encoding="utf-8")
CSS = INDEX_CSS.read_text(encoding="utf-8")
HTML = INDEX_HTML.read_text(encoding="utf-8")
FP_JS = FIRST_PERSON_JS.read_text(encoding="utf-8")
FP_CSS = FIRST_PERSON_CSS.read_text(encoding="utf-8")
PACKAGE = PACKAGE_JSON.read_text(encoding="utf-8")
ANDROID = ANDROID_BILLING.read_text(encoding="utf-8") if ANDROID_BILLING.exists() else ""
MANIFEST = ANDROID_MANIFEST.read_text(encoding="utf-8") if ANDROID_MANIFEST.exists() else ""
ALL_SOURCE = "\n".join([JS, CSS, FP_JS, FP_CSS, HTML, PACKAGE, ANDROID, MANIFEST])

ERRORS: list[str] = []
WARNINGS: list[str] = []
INFO: list[str] = []


def fail(section: str, detail: str) -> None:
    ERRORS.append(f"[{section}] {detail}")


def warn(section: str, detail: str) -> None:
    WARNINGS.append(f"[{section}] {detail}")


def ok(section: str, detail: str) -> None:
    INFO.append(f"[{section}] {detail}")


def require_token(section: str, token: str, source: str = ALL_SOURCE) -> None:
    if token not in source:
        fail(section, f"Missing token: {token}")


def normalize_tr_ascii(value: str = "") -> str:
    table = str.maketrans(
        {
            "ç": "c",
            "ğ": "g",
            "ı": "i",
            "ö": "o",
            "ş": "s",
            "ü": "u",
            "Ç": "c",
            "Ğ": "g",
            "İ": "i",
            "I": "i",
            "Ö": "o",
            "Ş": "s",
            "Ü": "u",
        }
    )
    return value.translate(table).lower().replace("i̇", "i")


def extract_balanced(text: str, open_index: int, open_char: str = "{", close_char: str = "}") -> str:
    """Return a balanced JS-ish block, ignoring braces inside strings."""
    if open_index < 0 or open_index >= len(text) or text[open_index] != open_char:
        return ""
    depth = 0
    quote = ""
    escaped = False
    for idx in range(open_index, len(text)):
        ch = text[idx]
        if quote:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                quote = ""
            continue
        if ch in ("'", '"', "`"):
            quote = ch
            continue
        if ch == open_char:
            depth += 1
        elif ch == close_char:
            depth -= 1
            if depth == 0:
                return text[open_index : idx + 1]
    return ""


def object_after(marker: str, source: str = JS) -> str:
    pos = source.find(marker)
    if pos < 0:
        return ""
    brace = source.find("{", pos)
    return extract_balanced(source, brace, "{", "}")


def array_after(marker: str, source: str = JS) -> str:
    pos = source.find(marker)
    if pos < 0:
        return ""
    bracket = source.find("[", pos)
    return extract_balanced(source, bracket, "[", "]")


def js_string_values(block: str) -> list[str]:
    return [m.group(2) for m in re.finditer(r"(['\"])(.*?)(?<!\\)\1", block, re.S)]


def i18n_object_for_lang(lang: str) -> str:
    if lang == "ru":
        ru = object_after("I18N.ru=", JS)
        if ru:
            return ru
    i18n = object_after("const I18N=", JS)
    match = re.search(rf"\b{re.escape(lang)}\s*:\s*{{", i18n)
    if not match:
        return ""
    return extract_balanced(i18n, match.end() - 1, "{", "}")


def i18n_keys(lang: str) -> set[str]:
    obj = i18n_object_for_lang(lang)
    return set(re.findall(r"'([^']+)'\s*:", obj))


def first_name_from_display(display: str) -> str:
    stopwords = {
        "kaptan",
        "bas",
        "baski",
        "muhendis",
        "zabit",
        "lostromo",
        "silici",
        "yagci",
        "asci",
        "tayfa",
        "usta",
        "hanim",
        "bey",
        "1",
        "2",
        "3",
        "1.",
        "2.",
        "3.",
        "gemici",
        "basi",
        "başı",
        "motorcu",
        "kambuzcu",
        "garson",
        "elektrisyen",
        "müdürü",
        "aşçı",
        "yağcı",
        "çarkçı",
        "güvenlik",
        "steward",
        "stewardess",
        "hotel",
        "muduru",
        "chief",
        "engineer",
        "cook",
        "oiler",
        "ab",
        "deck",
        "foreman",
        "rating",
        "motorman",
        "pumpman",
        "fitter",
        "welder",
        "doctor",
        "medical",
        "security",
        "officer",
        "captain",
        "second",
        "third",
        "able",
        "seafarer",
        "capitan",
        "kapitan",
        "kapitaen",
        "capitaine",
        "chef",
        "oficial",
        "offizier",
        "officier",
    }
    tokens = [
        re.sub(r"[^\w.]", "", normalize_tr_ascii(part))
        for part in display.split()
    ]
    tokens = [token for token in tokens if token and token not in stopwords]
    return tokens[0] if tokens else ""


def check_languages() -> None:
    section = "language"
    langs = set(re.findall(r"\n\s+([a-z]{2})\s*:\s*{label:", object_after("const GAME_LANGUAGES=", JS)))
    required = {"tr", "en", "es", "de", "fr", "ru", "zh"}
    missing_langs = sorted(required - langs)
    if missing_langs:
        fail(section, f"GAME_LANGUAGES missing: {', '.join(missing_langs)}")
    else:
        ok(section, "All supported language switches are declared.")

    mandatory_keys = {
        "ui.language",
        "ui.save",
        "ui.sound",
        "ui.map",
        "ui.devices",
        "ui.phone",
        "save.center",
        "save.saveGame",
        "mode.simple",
        "mode.realistic",
        "role.master",
        "guide.default",
        "scene.brief",
        "scene.task",
        "scene.inspectTask",
    }
    en = i18n_keys("en")
    if not mandatory_keys.issubset(en):
        fail(section, f"English I18N missing mandatory keys: {sorted(mandatory_keys - en)}")

    for lang in ("en", "es", "de", "fr", "ru", "zh"):
        keys = i18n_keys(lang)
        if not keys:
            fail(section, f"I18N object not found for {lang}.")
            continue
        missing = sorted(mandatory_keys - keys)
        if missing:
            fail(section, f"{lang} mandatory I18N keys missing: {missing}")
        if len(keys) < 40:
            warn(section, f"{lang} has only {len(keys)} I18N keys; consider expanding menu coverage.")

    for lang in ("en", "es", "de", "fr", "ru", "zh"):
        if f"\n  {lang}:[" not in JS:
            fail(section, f"DYNAMIC_TRANSLATIONS has no {lang} section.")

    turkish_leftovers = {
        "Kaptan",
        "Süvari",
        "Stajyer",
        "Köprüüstü",
        "Güverte",
        "Liman",
        "Harita Gorevi",
        "Kayitli gemi",
    }
    for lang in ("en", "es", "de", "fr", "ru", "zh"):
        obj = i18n_object_for_lang(lang)
        leftovers = sorted(word for word in turkish_leftovers if word in obj)
        if leftovers:
            warn(section, f"{lang} I18N still contains Turkish UI words: {leftovers[:6]}")


def check_character_portraits() -> None:
    section = "character"
    require_token(section, "const CREW_PORTRAIT_VERSION = 5;", JS)
    require_token(section, "female:[1,3,5,7]", JS)
    require_token(section, "female:[1,3,6]", JS)
    require_token(section, "if(out.base === 'female') out.beard = 'clean';", JS)
    require_token(section, "support-style-female-cutout.png", JS)
    require_token(section, "support-style-male-cutout.png", JS)
    require_token(section, "sanitizeCrewPortraitRoster", JS)
    require_token(section, "crew_portrait_roster_sanitized", JS)
    require_token(section, "CREW_NAME_POOLS_BY_LANG", JS)
    require_token(section, "getCrewNamePoolForLanguage", JS)
    require_token(section, "Captain Emily Carter", JS)
    require_token(section, "Capitán Lucía Morales", JS)
    require_token(section, "Kapitän Anna Schneider", JS)
    require_token(section, "Capitaine Claire Moreau", JS)
    require_token(section, "Капитан Анна Соколова", JS)
    require_token(section, "船长 李娜", JS)

    markers_block = array_after("const FEMALE_NAME_MARKERS", JS)
    markers = {normalize_tr_ascii(value) for value in js_string_values(markers_block)}
    known_female = {
        "elif",
        "pinar",
        "nilay",
        "ece",
        "serra",
        "leyla",
        "defne",
        "derya",
        "busra",
        "aylin",
        "alara",
        "nermin",
        "ayse",
        "burcu",
        "zeynep",
        "selin",
        "gizem",
        "asli",
        "ebru",
        "dilek",
        "emily",
        "sarah",
        "lucia",
        "sofia",
        "carmen",
        "anna",
        "lena",
        "claire",
        "sophie",
        "marie",
        "анна",
        "ольга",
        "елена",
        "李娜",
        "王芳",
        "刘芳",
    }
    missing = sorted(known_female - markers)
    if missing:
        fail(section, f"Known female names missing from marker list: {missing}")

    pools = object_after("const CREW_NAME_POOLS", JS)
    crew_names = js_string_values(pools)
    wrong_known = []
    for display in crew_names:
        first = first_name_from_display(display)
        if first in known_female and first not in markers and "hanim" not in normalize_tr_ascii(display):
            wrong_known.append(display)
    if wrong_known:
        fail(section, f"Female crew names not protected by marker list: {wrong_known[:8]}")

    if "__portraitVersion:3" in JS:
        fail(section, "Old crew portrait cache version 3 is still present in index.js.")

    old_indexes = re.findall(r"female:\[([^\]]*9[^\]]*|[^\]]*11[^\]]*|[^\]]*13[^\]]*|[^\]]*15[^\]]*)\]", JS)
    if old_indexes:
        fail(section, "Female officer pools still contain non-existent 16-cell sheet indexes.")

    ok(section, f"Checked {len(crew_names)} crew name presets and portrait gender guardrails.")


def check_crew_roster_counts() -> None:
    section = "crew-roster"
    for token in (
        "SHIP_TYPE_ACTIVE_CREW_KEYS",
        "STANDARD_TRADING_CREW_KEYS",
        "getActiveSpecialistCrewKeysForShipType",
        "getCrewRosterNote",
        "kont:'19 aktif'",
        "AKTIF GEMI KADROSU",
    ):
        require_token(section, token, JS)

    active_rosters = object_after("const SHIP_TYPE_ACTIVE_CREW_KEYS", JS)
    match = re.search(r"\bkont\s*:\s*\[([^\]]+)\]", active_rosters, re.S)
    if not match:
        fail(section, "Container active crew profile is missing.")
        return
    container_count = len(re.findall(r"['\"]([^'\"]+)['\"]", match.group(1)))
    if container_count > 22:
        fail(section, f"Container active crew is too high: {container_count}; expected 18-22.")
    elif container_count < 16:
        warn(section, f"Container active crew looks low: {container_count}.")
    else:
        ok(section, f"Container active crew count is realistic for game scope: {container_count}.")


def check_map_and_ecdis() -> None:
    section = "map"
    for token in [
        "const MAP_TASKS = [",
        "getMapTaskVisibleHitboxes",
        "isInsideVisibleHitbox",
        "normalizeClickableSurface",
        "getClickedWorldChartIndexSheet",
        "buildEcdisChartControlOverlay",
        "runMapTaskReplay",
        "buildWorldShodbChartIndexOverlay",
        "TRADE_VOYAGE_ROUTES.push",
        "MAJOR_TRADE_ROUTE_KEYS",
        "getMapTaskChartSymbol",
        "getMapTaskEffectiveTolerance",
        "map-task-touch-area",
        "showMapTapFeedback",
        "focusCurrentMapTask",
        "xMidYMid meet",
        "map-task-callout",
        "renderRadarInteractionVisual",
        "radar-task-console",
        "CONTACT B",
        "cpa:'0.4'",
        "renderMooringInteractionVisual",
        "renderEcdisInteractionVisual",
        "renderFireInteractionVisual",
        "renderSurvivalInteractionVisual",
        "renderBunkerInteractionVisual",
        "renderMobInteractionVisual",
        "interaction-guide-card",
        "interaction-replay",
        "MAP_ECDIS_DETAIL_POLICY",
        "getMapEcdisPerformanceProfile",
        "createLiveVoyageWaypointEvent",
        "getLiveVoyageEventPanel",
        "buildContractEndReport",
        "getContractCinematicReportPanel",
        "contract-cinematic-report",
        "mooring-operation-console",
        "mooring-snap-zone",
        "mooring-safe-zone",
        "SAFE STAND-BY",
        "TENSION RISING",
        "groan-of-the-keel.mp3",
        "startIntroRecordedTrack",
        "playIntroSynthMaritimeTheme",
        "playIntroMaritimeTheme",
        "maybeStartIntroMaritimeTheme",
    ]:
        require_token(section, token, JS)

    tasks = array_after("const MAP_TASKS", JS)
    task_count = len(re.findall(r"\bid\s*:\s*['\"]", tasks))
    if task_count < 12:
        fail(section, f"Expected at least 12 map tasks, found {task_count}.")
    else:
        ok(section, f"Map task count: {task_count}.")

    if "tol:" not in JS and "hitboxes" not in JS:
        fail(section, "No tolerance/hitbox language found for map tasks.")
    if "label:'T1'" in JS or 'label:"T1"' in JS:
        fail(section, "Debug-style T1 radar target labels are visible again.")
    if "chart bu görev için uygun değil" in normalize_tr_ascii(JS):
        warn(section, "A hard 'chart not suitable' style message may still exist; prefer teaching fallback.")


def check_billing_products() -> None:
    section = "billing"
    expected = {
        "PREMIUM_PRODUCT_ID": "premium_full_pack",
        "ADS_REMOVAL_PRODUCT_ID": "remove_ads",
        "PREMIUM_PRICE_LABEL": "75 TL",
        "ADS_REMOVAL_PRICE_LABEL": "50 TL",
    }
    for const_name, value in expected.items():
        require_token(section, f"const {const_name} = '{value}';", JS)
    if not ANDROID_BILLING.exists():
        warn(section, "Android billing bridge file not found; web QA only.")
    else:
        for value in ("premium_full_pack", "remove_ads"):
            if value not in ANDROID:
                fail(section, f"Android billing bridge missing product ID: {value}")
        if "return null;" not in ANDROID:
            fail(section, "Unknown billing product IDs must not fall back to premium.")
        ok(section, "Premium and remove-ads product IDs are aligned with Android bridge.")
    if ANDROID_MANIFEST.exists():
        require_token(section, 'android:allowBackup="false"', MANIFEST)
        require_token(section, 'android:fullBackupContent="false"', MANIFEST)
        require_token(section, 'android:usesCleartextTraffic="false"', MANIFEST)
    else:
        warn(section, "Android manifest not found; mobile store hardening not checked.")
    if "premiumUnlocked = !!data.premiumUnlocked" in JS or "adsRemoved = !!data.adsRemoved" in JS:
        fail(section, "Saved game payload must not unlock premium or remove-ads purchases.")
    if "localStorage.getItem(key)==='1'" in JS or "localStorage.setItem(PREMIUM_KEY,'1')" in JS or "localStorage.setItem(ADS_REMOVAL_KEY,'1')" in JS:
        fail(section, "Purchase flags must not use a raw localStorage '1' marker.")
    if "TEST-" in JS:
        fail(section, "Production purchase markers must not accept TEST- local unlocks.")
    for token in ("PURCHASE_MARKER_PREFIXES", "isTrustedPurchaseMarker", "writePurchasedFlag"):
        require_token(section, token, JS)
    if "premiumUnlocked || selType === 'kruvaziyer'" in JS:
        fail(section, "Cruise premium cinematic is bypassing the premium gate.")
    for token in ("requirePremiumAccess", "filterPremiumLockedScenes", "isPremiumContentScene"):
        require_token(section, token, JS)
    for token in ("refreshMonetizationState", "enforcePremiumAccessGuards", "premium_guard_applied"):
        require_token(section, token, JS)
    for token in ("GuverteAdsNative", "syncNativeAdsState", "openAdPrivacyOptions", "showInterstitial"):
        require_token(section, token, JS)
    ads_bridge = ROOT / "android" / "app" / "src" / "main" / "java" / "com" / "captainemo" / "guverte" / "GuverteAdsBridge.java"
    if ads_bridge.exists():
        ads_java = ads_bridge.read_text(encoding="utf-8")
        for token in ("InterstitialAd.load", "MIN_SHOW_INTERVAL_MS", "setAdsRemoved", "UserMessagingPlatform"):
            if token not in ads_java:
                fail(section, f"Android ads bridge missing token: {token}")
        ok(section, "Interstitial ads, remove-ads native gate, cooldown, and UMP consent bridge are present.")
    else:
        fail(section, "Android interstitial ads bridge file not found.")


def parse_effect_numbers() -> list[int]:
    nums: list[int] = []
    for body in re.findall(r"effect\s*:\s*{([^}]*)}", JS):
        nums.extend(int(n) for n in re.findall(r"[-+]?\d+", body))
    return nums


def check_scene_balance_and_text() -> None:
    section = "scene"
    scene_ids = re.findall(r"\bid\s*:\s*['\"`]([^'\"`]+)['\"`]", JS)
    if len(scene_ids) < 250:
        fail(section, f"Scene/data id count unexpectedly low: {len(scene_ids)}")
    else:
        ok(section, f"Scene/data id count: {len(scene_ids)}.")

    for bad in ("\ufffd", "[object Object]", "undefined undefined"):
        if bad in JS:
            fail(section, f"Suspicious broken text token found: {bad!r}")

    nums = parse_effect_numbers()
    if not nums:
        fail(section, "No choice effect values found.")
        return
    positives = sum(1 for n in nums if n > 0)
    negatives = sum(1 for n in nums if n < 0)
    if negatives < max(40, positives // 8):
        warn(section, f"Negative stat effects look sparse: {negatives} negative vs {positives} positive values.")
    max_abs = max(abs(n) for n in nums)
    if max_abs > 30:
        warn(section, f"Very large stat swing found: {max_abs}. Check balance.")
    if "tag:\"hileli\"" not in JS and "tag:'hileli'" not in JS:
        fail(section, "No hileli shortcut choices found.")

    for token in (
        "function sanitizeSceneCrewNames",
        "function personalizeSceneSpeakerText",
        "function getCrewNameParts",
        "personalizeSceneSpeakerText(sc.sub",
        "personalizeSceneSpeakerText(typeof sc.text",
        "personalizeSceneSpeakerText(c2.text",
    ):
        require_token(section, token)

    for stale_pair in (
        ("who:\"hasan\"", "Hasan bu kez seni"),
        ("who:'hasan'", "Hasan bu kez seni"),
    ):
        if stale_pair[0] in JS and stale_pair[1] in JS and "personalizeSceneSpeakerText" not in JS:
            fail(section, "Crew dialogue personalization is missing while hard-coded crew names exist.")

    writing_tokens = len(re.findall(r"<textarea|documentTrainingState|input type=\"text\"", JS))
    if writing_tokens < 3:
        warn(section, "Few document/writing-mode tokens found; form QA may be incomplete.")


def check_mobile_and_hitboxes() -> None:
    section = "mobile"
    for token in [
        "@media (orientation: landscape)",
        "100svh",
        "overflow-y:auto",
        "hitbox-standard",
        "button.hitbox-standard::after",
        "touch-action:pan-y pinch-zoom",
        "index.js?v=197",
        "index.css?v=171",
        "release-quality.js?v=10",
        "first-person-world.js?v=18",
        "first-person-world.css?v=18",
        "game-settings-vibration-btn",
        "toggleVibration",
        "navigator.vibrate",
        "normalizePlayerAppearance",
        "getSetupReadinessDetails",
        "getPremiumAccessSummary",
        "maybeQueueMapPracticeFromScene",
        "getGamePolishStatus",
        "RETENTION_KEY",
        "SEASON_CATALOG",
        "DAILY_MISSION_POOL",
        "renderRetentionPanel",
        "recordLeaderboardScore",
        "getProfessionalGraphicsOverlay",
        "pro-graphics-overlay",
        "suezConvoy",
        "panamaLock",
        "tankerManifold",
        "researchRov",
        "route3d",
        "ship-control-stage",
        "ship-control-pad",
        "shipwalk-avatar",
        "handleShipWalkKeydown",
        "bridge-walk-3d-scene",
        "BRIDGE_WALK_STATIONS",
        "openBridgeWalkDevice",
        "SHIP_OPERATION_MODES",
        "operation-walk-stage",
        "openShipOperation3D",
        "openCurrentSceneControlWalk",
        "bridge3d-control-launcher",
        "walkAvatarMotion",
        "getWalkAvatarMotionClass",
        "bridge3d-live-cadet",
        "WALK_MISSION_CHAINS",
        "queueWalkMission",
        "walk-mission-panel",
        "BRIDGE_WALK_NPCS",
        "bridge3d-npc",
        "ship-control-door",
        "firstPersonPlayer",
        "fp-hotspot",
        "fp-world",
        "handleFirstPersonKeydown",
        "openFirstPersonMode",
        "firstPersonArea",
        "FIRST_PERSON_AREA_DEFS",
        "setFirstPersonArea",
        "fp-body",
        "fpWalkBob",
        "firstPersonPointer",
        "handleFirstPersonPointerDown",
        "moveFirstPersonTowardScreen",
        "fp-minimap",
        "getFirstPersonDirectorTarget",
        "getFirstPersonDirectorHtml",
        "fp-director",
        "objective",
        "firstPersonInput",
        "tickFirstPersonMove",
        "startFirstPersonMove",
        "setFirstPersonDestination",
        "fp-destination",
        "renderFirstPersonFallback",
        "ensureFirstPersonHost",
        "renderFirstPersonBootScreen",
        "FIRST_PERSON_ROAMING_NPCS",
        "getFirstPersonRoamingNpcs",
        "firstPersonNpcTimer",
        "roaming",
        "fpNpcDrift",
        "openFirstPersonSeaLook",
        "fp-sea-look",
        "fp-deck-view",
        "deck-sea-port",
        "deck-bow-view",
        "bridge-wing-port",
        "bridge-wing-stbd",
        "bridge-binoculars",
        "openFirstPersonBinocularLook",
        "fp-binocular",
        "renderFirstPersonModeUnsafe",
        "fp-fallback-shell",
        "firstperson-btn",
        "area-engine",
        "area-deck",
        "area-cabin",
        "area-mess",
        "firstperson-panel",
    ]:
        require_token(section, token)

    # Catch obviously tiny clickable styles while ignoring status labels/feedback rows.
    interactive_words = ("button", ".tb-btn", ".cbtn", "#save-btn", "#game-settings-btn", "language-select", "device-key", "phone-app")
    low_interactive: list[str] = []
    for match in re.finditer(r"([^{}]+){[^{}]*min-height\s*:\s*(\d+)px", CSS):
        selector = " ".join(match.group(1).split())
        value = int(match.group(2))
        if value < 30 and any(word in selector for word in interactive_words):
            low_interactive.append(f"{selector}={value}px")
    if low_interactive:
        warn(section, "Clickable min-height below 30px: " + ", ".join(low_interactive[:8]))
    else:
        ok(section, "Clickable mobile targets stay at or above the compact tap threshold.")


def png_has_alpha(path: Path) -> bool:
    try:
        data = path.read_bytes()
    except OSError:
        return False
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        return False
    pos = 8
    has_trns = False
    color_type = -1
    while pos + 8 <= len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        chunk = data[pos + 4 : pos + 8]
        payload = data[pos + 8 : pos + 8 + length]
        if chunk == b"IHDR" and len(payload) >= 13:
            color_type = payload[9]
        if chunk == b"tRNS":
            has_trns = True
        if chunk == b"IEND":
            break
        pos += 12 + length
    return color_type in (4, 6) or has_trns


def png_idat_decodable(path: Path) -> bool:
    try:
        data = path.read_bytes()
    except OSError:
        return False
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        return True
    pos = 8
    idat_parts: list[bytes] = []
    while pos + 8 <= len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        chunk = data[pos + 4 : pos + 8]
        payload = data[pos + 8 : pos + 8 + length]
        if chunk == b"IDAT":
            idat_parts.append(payload)
        if chunk == b"IEND":
            break
        pos += 12 + length
    if not idat_parts:
        return False
    try:
        zlib.decompress(b"".join(idat_parts))
        return True
    except zlib.error:
        return False


def check_assets() -> None:
    section = "assets"
    three_module = VENDOR / "three.module.js"
    three_core = VENDOR / "three.core.js"
    if three_module.exists():
        three_module_text = three_module.read_text(encoding="utf-8", errors="ignore")
        if "./three.core.js" in three_module_text and not three_core.exists():
            fail(section, "www/vendor/three.core.js is missing but three.module.js imports it.")
        elif "./three.core.js" in three_module_text:
            ok(section, "Three.js module/core vendor pair is present.")

    if not ASSETS.exists():
        warn(section, "www/assets folder not found.")
        return
    image_ext = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
    images = [p for p in ASSETS.rglob("*") if p.suffix.lower() in image_ext]
    if not images:
        warn(section, "No image assets found.")
        return

    manifest = {}
    if ASSET_OPTIMIZATION_MANIFEST.exists():
        try:
            manifest = json.loads(ASSET_OPTIMIZATION_MANIFEST.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            fail(section, "Asset optimization manifest exists but is not valid JSON.")
    else:
        warn(section, "Asset optimization manifest missing; run python tools/optimize_assets.py before release.")

    large = sorted((p for p in images if p.stat().st_size > 1_500_000), key=lambda p: p.stat().st_size, reverse=True)
    if large and not manifest:
        warn(section, "Large assets over 1.5 MB: " + ", ".join(f"{p.name}={p.stat().st_size//1024}KB" for p in large[:8]))
    elif large:
        saved = int(manifest.get("savedBytes", 0) or 0)
        ok(section, f"{len(large)} large PNG assets remain but optimizer manifest is present; saved {saved//1024}KB losslessly.")

    referenced = JS + "\n" + CSS + "\n" + HTML
    unused = [p.name for p in images if p.name not in referenced and not p.name.endswith("-source.png")]
    if len(unused) > 12:
        warn(section, f"{len(unused)} image assets are not directly referenced; review for Play Store size.")

    cutouts = [p for p in images if "cutout" in p.name and p.suffix.lower() == ".png"]
    no_alpha = [p.name for p in cutouts if not png_has_alpha(p)]
    if no_alpha:
        warn(section, "Cutout PNGs without alpha channel may show black boxes: " + ", ".join(no_alpha[:8]))

    broken_pngs = [p.name for p in images if p.suffix.lower() == ".png" and not png_idat_decodable(p)]
    if broken_pngs:
        fail(section, "PNG assets failed IDAT decode: " + ", ".join(broken_pngs[:8]))


def check_route_generation_hook() -> None:
    section = "voyage-data"
    generator = TOOLS / "generate_voyage_data.py"
    if not generator.exists():
        fail(section, "tools/generate_voyage_data.py is missing.")
    else:
        text = generator.read_text(encoding="utf-8")
        for token in ("STRATEGIC_ROUTE_SEEDS", "waypoints", "chartTasks", "json.dump"):
            require_token(section, token, text)


def check_watch_director_realism() -> None:
    section = "watch-realism"
    for token in (
        "watchDirector3State",
        "getWatchDirector3Panel",
        "completeWatchDirector3Step",
        "workRestState",
        "getWorkRestHoursPanel",
        "brmCoachState",
        "getBrmManagementPanel",
        "editableReportState",
        "getEditableReportBookPanel",
        "surpriseInspectionState",
        "getSurpriseInspectionPanel",
        "maybeTriggerSurpriseInspection",
        "CERTIFICATE_COURSES",
        "getCertificateCoursePanel",
        "scenarioEditorState",
        "getScenarioEditorPanel",
        "runAdvancedWatchSpine",
        "Vardiya Direktoru 3.0",
    ):
        require_token(section, token, JS)


def main() -> int:
    check_languages()
    check_character_portraits()
    check_crew_roster_counts()
    check_map_and_ecdis()
    check_billing_products()
    check_scene_balance_and_text()
    check_mobile_and_hitboxes()
    check_assets()
    check_route_generation_hook()
    check_watch_director_realism()

    for line in INFO:
        print(f"OK {line}")
    for line in WARNINGS:
        print(f"WARN {line}")
    if ERRORS:
        for line in ERRORS:
            print(f"ERROR {line}")
        print(f"PRE_RELEASE_QA_FAILED errors={len(ERRORS)} warnings={len(WARNINGS)}")
        return 1
    print(f"PRE_RELEASE_QA_OK warnings={len(WARNINGS)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
