"""Release-readiness checks for diagnostics, save recovery and store delivery."""

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    target = ROOT / path
    if not target.exists():
        raise AssertionError(f"missing file: {path}")
    return target.read_text(encoding="utf-8")


def require(source: str, tokens: list[str], section: str) -> list[str]:
    return [f"[{section}] missing token: {token}" for token in tokens if token not in source]


def main() -> int:
    errors: list[str] = []
    js = read("www/index.js")
    html = read("www/index.html")
    css = read("www/index.css")
    quality = read("www/release-quality.js")
    activity = read("android/app/src/main/java/com/captainemo/guverte/MainActivity.java")
    diagnostics = read("android/app/src/main/java/com/captainemo/guverte/GuverteDiagnosticsBridge.java")
    checklist = read("PLAY_STORE_RELEASE_CHECKLIST.md")
    store_tr = read("store-listing/tr-TR.md")
    store_en = read("store-listing/en-US.md")

    errors += require(js, [
        "SAVE_BACKUP_KEY", "SAVE_RECOVERY_KEY", "recoverSavedGame",
        "isValidSavedGamePayload", "guverte-visual-quality-change",
        "CLEAN_HUD_KEY", "setCleanHudMode", "enforcePremiumAccessGuards",
        "sanitizeCrewPortraitRoster",
    ], "save-quality")
    errors += require(html + css + quality, [
        "tester-feedback-panel", "release-health-summary", "data-quality-controls",
        "runReleaseSelfTest", "exportSaveBackup", "handleSaveImport",
        "release-hardening-summary", "getReleaseHardeningChecks",
        "data-clean-hud-toggle", "clean-hud",
    ], "tester-ui")
    errors += require(activity + diagnostics, [
        "GuverteDiagnosticsNative", "installCrashHandler", "recordWebDiagnostic",
        "previousNativeCrash", "clearDiagnostics",
    ], "android-diagnostics")
    errors += require(checklist, [
        "premium_full_pack", "remove_ads", "Gercek cihaz matrisi",
        "Satin alma testi", "Kapali test",
    ], "release-checklist")
    errors += require(store_tr + store_en, [
        "Guverte", "Radar", "ECDIS", "VHF",
    ], "store-listing")

    if errors:
        for error in errors:
            print(f"ERROR {error}")
        print(f"RELEASE_READINESS_FAILED errors={len(errors)}")
        return 1
    print("RELEASE_READINESS_OK diagnostics save-recovery adaptive-quality store-assets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
