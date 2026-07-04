"""Generate structured voyage-route seed data for the game.

The browser build still keeps route data in JavaScript, but this tool gives us a
clean Python source for future chart/task generation. It can print JSON or write
it to a file:

    python tools/generate_voyage_data.py
    python tools/generate_voyage_data.py --out tools/generated/voyage_seed.json
"""

from __future__ import annotations

from pathlib import Path
import argparse
import json


ROOT = Path(__file__).resolve().parents[1]


STRATEGIC_ROUTE_SEEDS = [
    {
        "key": "turkish_straits_blacksea_med",
        "name": "Black Sea - Turkish Straits - East Mediterranean",
        "trade": "bulk / tanker / container feeder",
        "premium": False,
        "charts": ["Black Sea approach", "Istanbul Strait", "Marmara Sea", "Canakkale Strait", "Aegean exit"],
        "waypoints": [
            {"name": "Odessa pilot outbound", "lat": 46.50, "lon": 30.75, "risk": "traffic separation and pilotage"},
            {"name": "Bosphorus north entrance", "lat": 41.25, "lon": 29.13, "risk": "VTS reporting and current"},
            {"name": "Marmara waypoint", "lat": 40.75, "lon": 28.25, "risk": "dense crossing traffic"},
            {"name": "Dardanelles south exit", "lat": 40.02, "lon": 26.18, "risk": "restricted channel and pilot exchange"},
        ],
        "chartTasks": ["select_tss_lane", "mark_pilot_station", "acknowledge_ecdis_alarm", "vhf_vts_report"],
    },
    {
        "key": "suez_asia_europe",
        "name": "Singapore - Suez - Rotterdam",
        "trade": "container mainline",
        "premium": False,
        "charts": ["Singapore Strait", "Malacca Strait", "Bab el-Mandeb", "Suez Canal", "Dover Strait", "Rotterdam approach"],
        "waypoints": [
            {"name": "Singapore eastbound lane", "lat": 1.25, "lon": 104.05, "risk": "TSS and pilot traffic"},
            {"name": "Malacca deep water route", "lat": 3.70, "lon": 99.50, "risk": "fishing craft and CPA pressure"},
            {"name": "Suez south convoy", "lat": 29.92, "lon": 32.55, "risk": "convoy timing"},
            {"name": "Dover crossing", "lat": 51.00, "lon": 1.45, "risk": "cross-channel traffic"},
        ],
        "chartTasks": ["route_check", "cpa_tcpa_target", "pilot_boarding_point", "contingency_route"],
    },
    {
        "key": "hormuz_energy_lane",
        "name": "Ras Tanura - Hormuz - Fujairah - Singapore",
        "trade": "crude / products tanker",
        "premium": False,
        "charts": ["Arabian Gulf", "Strait of Hormuz", "Gulf of Oman", "Arabian Sea", "Malacca Strait"],
        "waypoints": [
            {"name": "Ras Tanura departure", "lat": 26.65, "lon": 50.15, "risk": "terminal and loading master"},
            {"name": "Hormuz west traffic lane", "lat": 26.55, "lon": 56.15, "risk": "Iran/Oman traffic separation"},
            {"name": "Fujairah bunker area", "lat": 25.15, "lon": 56.55, "risk": "anchorage and bunker operations"},
            {"name": "Malacca entry", "lat": 5.75, "lon": 95.20, "risk": "dense traffic and reporting"},
        ],
        "chartTasks": ["no_anchoring_area", "manifold_readiness", "security_level", "radar_guard_zone"],
    },
    {
        "key": "panama_transpacific",
        "name": "Shanghai - Los Angeles - Panama - US Gulf",
        "trade": "container / car carrier",
        "premium": False,
        "charts": ["East China Sea", "North Pacific", "Los Angeles approach", "Panama Canal", "US Gulf approach"],
        "waypoints": [
            {"name": "Yangshan departure", "lat": 30.62, "lon": 122.10, "risk": "pilotage and terminal pressure"},
            {"name": "North Pacific great circle", "lat": 42.00, "lon": 170.00, "risk": "weather routing"},
            {"name": "LA pilot station", "lat": 33.62, "lon": -118.20, "risk": "VTS and pilot boarding"},
            {"name": "Panama Cristobal anchorage", "lat": 9.35, "lon": -79.92, "risk": "canal booking and anchorage"},
        ],
        "chartTasks": ["weather_route", "pilot_station", "canal_convoy", "ukc_squat_check"],
    },
    {
        "key": "north_sea_offshore_dp",
        "name": "Aberdeen - North Sea Platform Supply",
        "trade": "offshore PSV / AHTS",
        "premium": True,
        "charts": ["Aberdeen approach", "North Sea traffic", "500m safety zone", "Platform DP chart"],
        "waypoints": [
            {"name": "Aberdeen departure", "lat": 57.14, "lon": -2.08, "risk": "port traffic and weather window"},
            {"name": "Platform 500m zone", "lat": 58.25, "lon": 1.75, "risk": "DP approach and abort point"},
            {"name": "Lee side cargo run", "lat": 58.26, "lon": 1.74, "risk": "hose/crane and station keeping"},
        ],
        "chartTasks": ["dp_abort_point", "thruster_load", "platform_safety_zone", "cargo_hose_status"],
    },
    {
        "key": "research_rov_atlantic",
        "name": "Azores - Atlantic Survey Grid",
        "trade": "research / ROV / CTD",
        "premium": True,
        "charts": ["Azores approach", "Atlantic survey grid", "ROV dive box", "Weather suspend area"],
        "waypoints": [
            {"name": "Ponta Delgada departure", "lat": 37.74, "lon": -25.67, "risk": "port clearance"},
            {"name": "Survey line start", "lat": 38.15, "lon": -28.50, "risk": "line keeping and data quality"},
            {"name": "ROV dive box", "lat": 38.30, "lon": -29.10, "risk": "tether tension and DP alarm"},
        ],
        "chartTasks": ["survey_line", "rov_tether", "ctd_station", "weather_suspend"],
    },
]


def build_payload() -> dict:
    return {
        "schema": "guverte.voyage-seed.v1",
        "source": "tools/generate_voyage_data.py",
        "routeCount": len(STRATEGIC_ROUTE_SEEDS),
        "routes": STRATEGIC_ROUTE_SEEDS,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, help="Optional output JSON path.")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON.")
    args = parser.parse_args()

    payload = build_payload()
    indent = 2 if args.pretty or args.out else None
    text = json.dumps(payload, ensure_ascii=False, indent=indent)

    if args.out:
        out_path = args.out if args.out.is_absolute() else ROOT / args.out
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(text + "\n", encoding="utf-8")
        print(f"VOYAGE_DATA_WRITTEN {out_path}")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
