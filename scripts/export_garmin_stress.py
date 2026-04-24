#!/usr/bin/env python3
"""Export Garmin Connect stress data as JSON or CSV.

This script is designed for the `garminconnect` Python package and aims to make
Garmin stress data easier to use in JavaScript tools such as Observable
notebooks.

It always writes the raw Garmin API payload to disk, then attempts to normalize
timestamped stress samples from the response. If Garmin returns timestamp/value
pairs, those are preserved directly. If Garmin only returns a per-day stress
array without explicit timestamps, the script reconstructs timestamps evenly
across the day using the array length and any available start/end timestamps in
the payload.
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import sys
from collections.abc import Iterable
from datetime import date, datetime, time, timedelta, timezone
from getpass import getpass
from pathlib import Path
from typing import Any

from garminconnect import (
    Garmin,
    GarminConnectAuthenticationError,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
)

logging.getLogger("garminconnect").setLevel(logging.CRITICAL)

TOKENSTORE_DEFAULT = "~/.garminconnect"
DEFAULT_OUTPUT_DIR = "exports/garmin"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export Garmin Connect stress data as JSON and/or CSV."
    )
    parser.add_argument(
        "--date",
        dest="single_date",
        help="Single date to export in YYYY-MM-DD format. Defaults to today.",
    )
    parser.add_argument("--start", help="Start date in YYYY-MM-DD format.")
    parser.add_argument("--end", help="End date in YYYY-MM-DD format.")
    parser.add_argument(
        "--output-dir",
        default=DEFAULT_OUTPUT_DIR,
        help=f"Directory for exported files. Defaults to {DEFAULT_OUTPUT_DIR}.",
    )
    parser.add_argument(
        "--format",
        choices=("json", "csv", "both"),
        default="both",
        help="Normalized export format. Raw JSON is always written.",
    )
    parser.add_argument(
        "--tokenstore",
        default=os.getenv("GARMINTOKENS", TOKENSTORE_DEFAULT),
        help="Garmin token directory. Defaults to ~/.garminconnect.",
    )
    parser.add_argument(
        "--combined-name",
        help=(
            "Base filename for a combined range export, without extension. "
            "Only used when exporting multiple dates."
        ),
    )
    return parser.parse_args()


def parse_iso_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise SystemExit(f"Invalid date '{value}'. Use YYYY-MM-DD.") from exc


def resolve_dates(args: argparse.Namespace) -> list[date]:
    if args.single_date and (args.start or args.end):
        raise SystemExit("Use either --date or --start/--end, not both.")

    if args.start or args.end:
        if not (args.start and args.end):
            raise SystemExit("When using a range, provide both --start and --end.")
        start_date = parse_iso_date(args.start)
        end_date = parse_iso_date(args.end)
        if start_date > end_date:
            raise SystemExit("--start must be before or equal to --end.")
        days = (end_date - start_date).days + 1
        return [start_date + timedelta(days=index) for index in range(days)]

    target_date = parse_iso_date(args.single_date) if args.single_date else date.today()
    return [target_date]


def init_api(tokenstore: str) -> Garmin:
    tokenstore_path = str(Path(tokenstore).expanduser())

    try:
        api = Garmin()
        api.login(tokenstore_path)
        print(f"Logged in using saved tokens from {tokenstore_path}", file=sys.stderr)
        return api
    except GarminConnectTooManyRequestsError as exc:
        raise SystemExit(f"Garmin rate limit hit during token login: {exc}") from exc
    except (GarminConnectAuthenticationError, GarminConnectConnectionError):
        pass

    email = os.getenv("EMAIL") or input("Garmin email: ").strip()
    password = os.getenv("PASSWORD") or getpass("Garmin password: ")

    try:
        api = Garmin(
            email=email,
            password=password,
            prompt_mfa=lambda: input("MFA code: ").strip(),
        )
        api.login(tokenstore_path)
        print(f"Login successful. Tokens saved to {tokenstore_path}", file=sys.stderr)
        return api
    except GarminConnectTooManyRequestsError as exc:
        raise SystemExit(f"Garmin rate limit hit during login: {exc}") from exc
    except GarminConnectAuthenticationError as exc:
        raise SystemExit(f"Garmin authentication failed: {exc}") from exc
    except GarminConnectConnectionError as exc:
        raise SystemExit(f"Could not connect to Garmin: {exc}") from exc


def fetch_candidate_payloads(api: Garmin, target_date: str) -> list[dict[str, Any]]:
    methods: list[tuple[str, Any]] = []

    if hasattr(api, "get_body_battery_events"):
        methods.append(("get_body_battery_events", getattr(api, "get_body_battery_events")))
    if hasattr(api, "get_stress_data"):
        methods.append(("get_stress_data", getattr(api, "get_stress_data")))
    if hasattr(api, "get_body_battery"):
        methods.append(("get_body_battery", getattr(api, "get_body_battery")))

    attempts: list[dict[str, Any]] = []

    for method_name, method in methods:
        try:
            attempts.append(
                {
                    "source_name": method_name,
                    "payload": method(target_date),
                    "error": None,
                }
            )
        except Exception as exc:  # noqa: BLE001 - keep trying fallback methods
            attempts.append(
                {
                    "source_name": method_name,
                    "payload": None,
                    "error": str(exc),
                }
            )

    fallback_attempts: list[tuple[str, str, dict[str, Any]]] = []
    body_battery_events_url = getattr(api, "garmin_connect_body_battery_events_url", None)
    daily_stress_url = getattr(api, "garmin_connect_daily_stress_url", None)

    if body_battery_events_url:
        fallback_attempts.extend(
            [
                (
                    "connectapi(bodyBattery/events/<date>)",
                    f"{body_battery_events_url}/{target_date}",
                    {},
                ),
            ]
        )

    if daily_stress_url:
        fallback_attempts.extend(
            [
                (
                    "connectapi(dailyStress/<date>)",
                    f"{daily_stress_url}/{target_date}",
                    {},
                ),
            ]
        )

    for label, path, kwargs in fallback_attempts:
        try:
            attempts.append(
                {
                    "source_name": label,
                    "payload": api.connectapi(path, **kwargs),
                    "error": None,
                }
            )
        except Exception as exc:  # noqa: BLE001 - keep trying fallback methods
            attempts.append(
                {
                    "source_name": label,
                    "payload": None,
                    "error": str(exc),
                }
            )

    if any(item["payload"] is not None for item in attempts):
        return attempts

    joined_errors = "\n".join(
        f"  - {item['source_name']}: {item['error']}" for item in attempts
    )
    raise RuntimeError(
        "Could not fetch stress data with the available Garmin endpoints.\n"
        f"Tried:\n{joined_errors}"
    )


def walk_dicts(value: Any) -> Iterable[dict[str, Any]]:
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from walk_dicts(nested)
    elif isinstance(value, list):
        for item in value:
            yield from walk_dicts(item)


def find_calendar_date(value: Any) -> str | None:
    for item in walk_dicts(value):
        for key in ("calendarDate", "calendar_date"):
            maybe_date = item.get(key)
            if isinstance(maybe_date, str):
                return maybe_date
    return None


def parse_timestamp(value: Any) -> datetime | None:
    if isinstance(value, (int, float)):
        if value > 10_000_000_000:
            return datetime.fromtimestamp(value / 1000, tz=timezone.utc)
        if value > 1_000_000_000:
            return datetime.fromtimestamp(value, tz=timezone.utc)
        return None

    if not isinstance(value, str):
        return None

    text = value.strip()
    if not text:
        return None

    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        pass

    for fmt in ("%Y-%m-%d %H:%M:%S.%f GMT", "%Y-%m-%d %H:%M:%S GMT"):
        try:
            return datetime.strptime(text, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue

    return None


def find_first_timestamp(payload: Any, keys: tuple[str, ...]) -> datetime | None:
    for item in walk_dicts(payload):
        for key in keys:
            if key in item:
                timestamp = parse_timestamp(item[key])
                if timestamp is not None:
                    return timestamp
    return None


def is_timestamp_pair_series(value: Any) -> bool:
    if not isinstance(value, list) or not value:
        return False
    return all(
        isinstance(item, list)
        and len(item) >= 2
        and isinstance(item[0], (int, float))
        and item[0] > 1_000_000_000
        for item in value
    )


def is_numeric_bucket_series(value: Any) -> bool:
    if not isinstance(value, list) or len(value) < 24:
        return False
    return all(item is None or isinstance(item, (int, float)) for item in value)


def iter_candidate_series(
    value: Any,
    path: tuple[str, ...] = (),
) -> Iterable[tuple[tuple[str, ...], Any]]:
    if isinstance(value, dict):
        for key, nested in value.items():
            next_path = (*path, key)
            lowered = key.lower()
            if "stress" in lowered and (
                is_timestamp_pair_series(nested) or is_numeric_bucket_series(nested)
            ):
                yield next_path, nested
            yield from iter_candidate_series(nested, next_path)
    elif isinstance(value, list):
        for index, item in enumerate(value):
            yield from iter_candidate_series(item, (*path, str(index)))


def normalize_timestamp_pairs(
    series: list[list[Any]],
    target_date: str,
    source_path: tuple[str, ...],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for item in series:
        timestamp = parse_timestamp(item[0])
        if timestamp is None:
            continue
        rows.append(
            {
                "date": target_date,
                "timestamp": timestamp.astimezone(timezone.utc).isoformat(),
                "stress_level": item[1],
                "source": ".".join(source_path),
            }
        )
    return rows


def normalize_bucket_series(
    series: list[Any],
    payload: Any,
    target_date: str,
    source_path: tuple[str, ...],
) -> list[dict[str, Any]]:
    if not series:
        return []

    start_timestamp = find_first_timestamp(
        payload,
        (
            "startTimestampLocal",
            "startTimestampGMT",
            "startTimeLocal",
            "startTimeGMT",
            "start_timestamp_local",
            "start_timestamp_gmt",
        ),
    )
    end_timestamp = find_first_timestamp(
        payload,
        (
            "endTimestampLocal",
            "endTimestampGMT",
            "endTimeLocal",
            "endTimeGMT",
            "end_timestamp_local",
            "end_timestamp_gmt",
        ),
    )

    if start_timestamp is None:
        day_value = find_calendar_date(payload) or target_date
        start_timestamp = datetime.combine(
            parse_iso_date(day_value), time.min, tzinfo=timezone.utc
        )

    if end_timestamp is None or end_timestamp <= start_timestamp:
        spacing_seconds = (24 * 60 * 60) / len(series)
    else:
        spacing_seconds = (end_timestamp - start_timestamp).total_seconds() / len(series)

    rows: list[dict[str, Any]] = []
    for index, stress_level in enumerate(series):
        if stress_level is None:
            continue
        timestamp = start_timestamp + timedelta(seconds=spacing_seconds * index)
        rows.append(
            {
                "date": target_date,
                "timestamp": timestamp.astimezone(timezone.utc).isoformat(),
                "stress_level": stress_level,
                "source": ".".join(source_path),
                "derived_timestamp": True,
            }
        )
    return rows


def normalize_stress_rows(payload: Any, target_date: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []

    for source_path, series in iter_candidate_series(payload):
        if is_timestamp_pair_series(series):
            rows.extend(normalize_timestamp_pairs(series, target_date, source_path))
        elif is_numeric_bucket_series(series):
            rows.extend(normalize_bucket_series(series, payload, target_date, source_path))

    deduped: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in rows:
        deduped[(row["date"], row["timestamp"], row["source"])] = row

    return sorted(deduped.values(), key=lambda row: (row["timestamp"], row["source"]))


def ensure_output_dir(path: str) -> Path:
    output_dir = Path(path).expanduser()
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    fieldnames = ["date", "timestamp", "stress_level", "source", "derived_timestamp"]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "date": row.get("date"),
                    "timestamp": row.get("timestamp"),
                    "stress_level": row.get("stress_level"),
                    "source": row.get("source"),
                    "derived_timestamp": row.get("derived_timestamp", False),
                }
            )


def build_combined_base_name(dates: list[date], custom_name: str | None) -> str:
    if custom_name:
        return custom_name
    if len(dates) == 1:
        return f"garmin-stress-{dates[0].isoformat()}"
    return f"garmin-stress-{dates[0].isoformat()}-to-{dates[-1].isoformat()}"


def write_combined_exports(
    output_dir: Path,
    dates: list[date],
    daily_results: list[dict[str, Any]],
    export_format: str,
    combined_name: str | None,
) -> dict[str, Any] | None:
    if len(dates) <= 1 or not daily_results:
        return None

    base_name = build_combined_base_name(dates, combined_name)
    raw_json_path = output_dir / f"{base_name}-raw.json"
    raw_days = [result["raw_export"] for result in daily_results]
    write_json(raw_json_path, raw_days)

    combined_rows: list[dict[str, Any]] = []
    for result in daily_results:
        combined_rows.extend(result.get("normalized_rows", []))

    combined_rows.sort(key=lambda row: (row["timestamp"], row["source"]))

    json_path = output_dir / f"{base_name}.json"
    csv_path = output_dir / f"{base_name}.csv"

    if export_format in {"json", "both"}:
        write_json(json_path, combined_rows)
    if export_format in {"csv", "both"}:
        write_csv(csv_path, combined_rows)

    return {
        "row_count": len(combined_rows),
        "raw_json_path": str(raw_json_path),
        "json_path": str(json_path) if export_format in {"json", "both"} else None,
        "csv_path": str(csv_path) if export_format in {"csv", "both"} else None,
    }


def export_day(
    api: Garmin,
    day_value: date,
    output_dir: Path,
    export_format: str,
) -> dict[str, Any]:
    target_date = day_value.isoformat()
    attempts = fetch_candidate_payloads(api, target_date)

    successful_attempts: list[dict[str, Any]] = []
    for attempt in attempts:
        payload = attempt["payload"]
        if payload is None:
            continue
        normalized_rows = normalize_stress_rows(payload, target_date)
        successful_attempts.append(
            {
                "source_name": attempt["source_name"],
                "payload": payload,
                "normalized_rows": normalized_rows,
            }
        )

    if not successful_attempts:
        raise RuntimeError("All Garmin endpoint attempts failed.")

    best_attempt = max(
        successful_attempts,
        key=lambda item: (
            len(item["normalized_rows"]),
            item["source_name"] == "get_stress_data",
            "dailyStress" in item["source_name"],
            "bodyBattery/events" in item["source_name"],
        ),
    )
    source_name = best_attempt["source_name"]
    raw_payload = best_attempt["payload"]
    normalized_rows = best_attempt["normalized_rows"]

    raw_path = output_dir / f"garmin-stress-raw-{target_date}.json"
    raw_export = {
        "date": target_date,
        "fetched_with": source_name,
        "normalized_row_count": len(normalized_rows),
        "endpoint_attempts": [
            {
                "source_name": item["source_name"],
                "row_count": len(item["normalized_rows"]),
            }
            for item in successful_attempts
        ],
        "successful_payloads": [
            {
                "source_name": item["source_name"],
                "row_count": len(item["normalized_rows"]),
                "payload": item["payload"],
            }
            for item in successful_attempts
        ],
        "errors": [
            {
                "source_name": item["source_name"],
                "error": item["error"],
            }
            for item in attempts
            if item["error"] is not None
        ],
        "payload": raw_payload,
    }
    write_json(raw_path, raw_export)

    normalized_json_path = output_dir / f"garmin-stress-{target_date}.json"
    normalized_csv_path = output_dir / f"garmin-stress-{target_date}.csv"

    if export_format in {"json", "both"}:
        write_json(normalized_json_path, normalized_rows)
    if export_format in {"csv", "both"}:
        write_csv(normalized_csv_path, normalized_rows)

    return {
        "date": target_date,
        "source_name": source_name,
        "raw_path": str(raw_path),
        "normalized_json_path": (
            str(normalized_json_path) if export_format in {"json", "both"} else None
        ),
        "normalized_csv_path": (
            str(normalized_csv_path) if export_format in {"csv", "both"} else None
        ),
        "normalized_row_count": len(normalized_rows),
        "normalized_rows": normalized_rows,
        "raw_export": raw_export,
    }


def main() -> None:
    args = parse_args()
    dates = resolve_dates(args)
    output_dir = ensure_output_dir(args.output_dir)
    api = init_api(args.tokenstore)

    results = []
    for day_value in dates:
        try:
            result = export_day(api, day_value, output_dir, args.format)
            results.append(result)
            print(
                f"{result['date']}: wrote {result['normalized_row_count']} normalized rows "
                f"using {result['source_name']}",
                file=sys.stderr,
            )
        except Exception as exc:  # noqa: BLE001 - surface failures per day
            print(f"{day_value.isoformat()}: export failed: {exc}", file=sys.stderr)

    if not results:
        raise SystemExit("No exports succeeded.")

    combined_export = write_combined_exports(
        output_dir=output_dir,
        dates=dates,
        daily_results=results,
        export_format=args.format,
        combined_name=args.combined_name,
    )

    if combined_export is not None:
        print(
            f"combined range export: wrote {combined_export['row_count']} rows",
            file=sys.stderr,
        )

    summary = {"days": results}
    if combined_export is not None:
        summary["combined_export"] = combined_export

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
