"""
UNESCO Index Translationum - Latin to English Translations

Queries the UNESCO DataHub (OpenDataSoft) API to find all books
translated from Latin to English, grouped by year.

Dataset: tran001 (Index Translationum Bibliography)
Coverage: 1978-2008 (sample of the full Index Translationum)
Source: https://data.unesco.org/explore/dataset/tran001/

Usage:
    python scripts/scrapers/unesco_translations.py

    # Discover dataset schema (field names)
    python scripts/scrapers/unesco_translations.py --schema

    # Custom output directory
    python scripts/scrapers/unesco_translations.py --output-dir data/unesco

    # Search for any source/target language pair
    python scripts/scrapers/unesco_translations.py --source-lang Latin --target-lang English

    # Download all and filter/deduplicate locally
    python scripts/scrapers/unesco_translations.py --download-all

    # Analyze patterns in already-downloaded data
    python scripts/scrapers/unesco_translations.py --analyze data/unesco/unesco_latin_to_english_translations.csv
"""

import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path

import requests
import pandas as pd


# UNESCO DataHub (OpenDataSoft) API base
API_BASE = "https://data.unesco.org/api/explore/v2.1"
DATASET_ID = "tran001"

# Alternative base URL if the primary is unavailable
ALT_API_BASE = "https://datacatalog.unesco.org/api/explore/v2.1"

# Batch size for pagination
BATCH_SIZE = 100


def get_api_base(timeout=10):
    """Try primary API, fall back to alternate."""
    for base in [API_BASE, ALT_API_BASE]:
        try:
            resp = requests.get(
                f"{base}/catalog/datasets/{DATASET_ID}",
                timeout=timeout,
            )
            if resp.status_code == 200:
                print(f"Using API: {base}")
                return base
        except requests.RequestException:
            continue
    # Default to primary even if unreachable (user may have different network)
    print(f"Warning: Could not reach API. Defaulting to {API_BASE}")
    return API_BASE


def fetch_schema(api_base):
    """Fetch and display dataset schema (field names and types)."""
    url = f"{api_base}/catalog/datasets/{DATASET_ID}"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    fields = data.get("fields", [])
    print(f"\nDataset: {data.get('dataset_id', DATASET_ID)}")
    print(f"Title: {data.get('metas', {}).get('default', {}).get('title', 'N/A')}")
    print(f"Records count: {data.get('metas', {}).get('default', {}).get('records_count', 'N/A')}")
    print(f"\nFields ({len(fields)}):")
    print("-" * 60)
    for f in fields:
        name = f.get("name", "")
        ftype = f.get("type", "")
        label = f.get("label", "")
        desc = f.get("description", "")
        print(f"  {name:30s} ({ftype:10s}) - {label or desc}")

    return fields


def discover_language_fields(api_base):
    """Fetch a sample record to discover which fields contain language info."""
    url = f"{api_base}/catalog/datasets/{DATASET_ID}/records"
    resp = requests.get(url, params={"limit": 5}, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    records = data.get("results", [])
    if not records:
        print("No sample records returned.")
        return None

    print("\nSample record fields and values:")
    print("=" * 80)
    for key, value in sorted(records[0].items()):
        print(f"  {key:30s} = {value}")

    return records[0]


def find_language_field_names(sample_record):
    """Heuristically determine which fields represent source/target language."""
    candidates = {}
    for key, value in sample_record.items():
        if value is None:
            continue
        key_lower = key.lower()
        val_str = str(value).lower()
        # Look for fields that might contain language names
        if any(term in key_lower for term in [
            "lang", "language", "original", "source", "target",
            "orig", "targ", "sl", "tl", "from", "to",
        ]):
            candidates[key] = value

    if candidates:
        print("\nPotential language-related fields:")
        for k, v in candidates.items():
            print(f"  {k} = {v}")
    return candidates


def download_full_csv(api_base, filepath, where_clause=None):
    """Download entire dataset as CSV via the bulk export endpoint (no row limit).

    The /exports/csv endpoint returns the complete dataset in one request,
    unlike the /records endpoint which is paginated and row-limited.
    """
    url = f"{api_base}/catalog/datasets/{DATASET_ID}/exports/csv"
    params = {
        "delimiter": ",",
        "use_labels": "true",
    }
    if where_clause:
        params["where"] = where_clause

    print(f"  Downloading from: {url}")
    if where_clause:
        print(f"  Filter: {where_clause}")

    resp = requests.get(url, params=params, timeout=300, stream=True)
    resp.raise_for_status()

    # Stream to file
    total_bytes = 0
    with open(filepath, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
            total_bytes += len(chunk)
            print(f"  Downloaded {total_bytes / 1024:.0f} KB...", end="\r")

    print(f"\n  Saved {total_bytes / 1024:.1f} KB to {filepath}")

    # Read back as DataFrame
    df = pd.read_csv(filepath)
    print(f"  {len(df)} records, {len(df.columns)} columns")
    print(f"  Columns: {list(df.columns)}")
    return df


def fetch_all_records(api_base, where_clause=None, select_fields=None):
    """Fetch all matching records via paginated JSON API (fallback)."""
    url = f"{api_base}/catalog/datasets/{DATASET_ID}/records"
    all_records = []
    offset = 0

    while True:
        params = {
            "limit": BATCH_SIZE,
            "offset": offset,
        }
        if where_clause:
            params["where"] = where_clause
        if select_fields:
            params["select"] = select_fields

        resp = requests.get(url, params=params, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        records = data.get("results", [])
        total = data.get("total_count", 0)

        if not records:
            break

        all_records.extend(records)
        offset += len(records)
        print(f"  Fetched {len(all_records)} / {total} records...", end="\r")

        if offset >= total:
            break

        # Be polite to the API
        time.sleep(0.3)

    print(f"\n  Total records fetched: {len(all_records)}")
    return all_records


def export_csv(records, filepath):
    """Export records to CSV."""
    if not records:
        print("No records to export.")
        return

    df = pd.DataFrame(records)
    df.to_csv(filepath, index=False, quoting=csv.QUOTE_ALL)
    print(f"Exported {len(df)} records to {filepath}")
    return df


def build_where_clause(source_lang, target_lang, year=None, lang_fields=None):
    """Build ODSQL where clause for language filtering.

    Since we don't know the exact field names ahead of time, this function
    tries common field name patterns. The caller should verify which ones work.
    """
    if lang_fields:
        # Use provided field names
        src_field, tgt_field = lang_fields
    else:
        # Common field name patterns in OpenDataSoft UNESCO datasets
        # We'll try these in order
        src_field = "original_language"
        tgt_field = "target_language"

    clauses = []
    if source_lang:
        clauses.append(f'{src_field}="{source_lang}"')
    if target_lang:
        clauses.append(f'{tgt_field}="{target_lang}"')
    if year:
        clauses.append(f'year="{year}"')

    return " AND ".join(clauses)


def try_field_names(api_base, source_lang="Latin", target_lang="English"):
    """Try various field name combinations to find the right ones."""
    url = f"{api_base}/catalog/datasets/{DATASET_ID}/records"

    # Common field name patterns for source/target language
    field_pairs = [
        ("original_language", "target_language"),
        ("orig_lang", "target_lang"),
        ("source_language", "target_language"),
        ("source_lang", "target_lang"),
        ("sl", "tl"),
        ("language_original", "language_target"),
        ("lang_original", "lang_target"),
        ("original_language_name", "target_language_name"),
    ]

    for src_field, tgt_field in field_pairs:
        where = f'{src_field}="{source_lang}" AND {tgt_field}="{target_lang}"'
        try:
            resp = requests.get(
                url,
                params={"where": where, "limit": 1},
                timeout=15,
            )
            if resp.status_code == 200:
                data = resp.json()
                total = data.get("total_count", 0)
                if total > 0:
                    print(f"Found working fields: {src_field}, {tgt_field} ({total} records)")
                    return (src_field, tgt_field), total
                else:
                    # Fields exist but no matches - could be valid fields with different values
                    # Check if the response has errors
                    results = data.get("results", [])
                    # If we got a valid response structure, fields might be correct
                    print(f"  Tried {src_field}/{tgt_field}: 0 results")
            else:
                print(f"  Tried {src_field}/{tgt_field}: HTTP {resp.status_code}")
        except requests.RequestException as e:
            print(f"  Tried {src_field}/{tgt_field}: {e}")

    # Also try a text search approach
    print("\nTrying full-text search for 'Latin'...")
    try:
        resp = requests.get(
            url,
            params={"where": 'search("Latin")', "limit": 5},
            timeout=15,
        )
        if resp.status_code == 200:
            data = resp.json()
            total = data.get("total_count", 0)
            if total > 0:
                print(f"Full-text search found {total} records containing 'Latin'")
                records = data.get("results", [])
                if records:
                    print("Sample record:")
                    for k, v in sorted(records[0].items()):
                        print(f"    {k}: {v}")
    except requests.RequestException:
        pass

    return None, 0


def deduplicate_records(df):
    """Remove duplicate translation records.

    Duplicates can occur because:
    - Same book published in multiple countries/editions
    - Same translation re-published by different publishers
    - Data entry duplicates in the Index

    Strategy: group by normalized title + author + source/target language,
    keep the earliest publication year for each unique work.
    """
    original_count = len(df)

    # Find title and author columns
    title_cols = [c for c in df.columns if any(
        t in c.lower() for t in ["title", "titre"]
    )]
    author_cols = [c for c in df.columns if any(
        t in c.lower() for t in ["author", "auteur", "writer"]
    )]

    if not title_cols:
        print("Warning: No title column found. Cannot deduplicate.")
        return df, pd.DataFrame()

    title_col = title_cols[0]
    author_col = author_cols[0] if author_cols else None

    # Normalize for comparison
    df["_norm_title"] = (
        df[title_col]
        .fillna("")
        .str.lower()
        .str.strip()
        .str.replace(r"[^\w\s]", "", regex=True)
        .str.replace(r"\s+", " ", regex=True)
    )

    if author_col:
        df["_norm_author"] = (
            df[author_col]
            .fillna("")
            .str.lower()
            .str.strip()
            .str.replace(r"[^\w\s]", "", regex=True)
            .str.replace(r"\s+", " ", regex=True)
        )
        dedup_cols = ["_norm_title", "_norm_author"]
    else:
        dedup_cols = ["_norm_title"]

    # Find duplicates
    duplicates = df[df.duplicated(subset=dedup_cols, keep="first")]

    # Keep first occurrence (typically earliest year)
    year_col = None
    for col in df.columns:
        if "year" in col.lower() or "date" in col.lower():
            year_col = col
            break

    if year_col:
        df = df.sort_values(year_col)

    df_deduped = df.drop_duplicates(subset=dedup_cols, keep="first")

    # Clean up temp columns
    df_deduped = df_deduped.drop(columns=["_norm_title"] + (
        ["_norm_author"] if author_col else []
    ))
    duplicates_cleaned = duplicates.drop(columns=["_norm_title"] + (
        ["_norm_author"] if author_col else []
    ))

    removed = original_count - len(df_deduped)
    print(f"\nDeduplication: {original_count} → {len(df_deduped)} records ({removed} duplicates removed)")

    return df_deduped, duplicates_cleaned


def analyze_patterns(df, output_dir=None):
    """Analyze translation patterns in the dataset.

    Reports on:
    - Translations per year (trend)
    - Most translated authors
    - Most common publishers
    - Countries publishing Latin→English translations
    - Title patterns (religious, scientific, literary, etc.)
    """
    print("\n" + "=" * 70)
    print("TRANSLATION PATTERN ANALYSIS")
    print("=" * 70)

    # Find key columns
    col_map = {}
    for col in df.columns:
        cl = col.lower()
        if "year" in cl or "date" in cl:
            col_map.setdefault("year", col)
        if any(t in cl for t in ["author", "auteur"]):
            col_map.setdefault("author", col)
        if any(t in cl for t in ["title", "titre"]):
            col_map.setdefault("title", col)
        if any(t in cl for t in ["publisher", "editeur", "publish"]):
            col_map.setdefault("publisher", col)
        if any(t in cl for t in ["country", "pays"]):
            col_map.setdefault("country", col)
        if any(t in cl for t in ["original_title", "titre_original", "orig"]):
            col_map.setdefault("original_title", col)

    # 1. Yearly trend
    if "year" in col_map:
        yc = col_map["year"]
        if df[yc].dtype == "object":
            years = pd.to_datetime(df[yc], errors="coerce").dt.year
        else:
            years = df[yc]

        yearly = years.value_counts().sort_index()
        print(f"\n1. TRANSLATIONS PER YEAR ({len(yearly)} years of data)")
        print("-" * 50)
        for year, count in yearly.items():
            bar = "#" * min(count, 50)
            print(f"  {int(year):4d}: {count:4d} {bar}")
        print(f"\n  Average per year: {yearly.mean():.1f}")
        peak_year = yearly.idxmax()
        print(f"  Peak year: {int(peak_year)} ({yearly.max()} translations)")

    # 2. Most translated authors
    if "author" in col_map:
        ac = col_map["author"]
        authors = df[ac].dropna().str.strip()
        author_counts = authors.value_counts().head(30)
        print(f"\n2. MOST TRANSLATED AUTHORS (top 30)")
        print("-" * 50)
        for author, count in author_counts.items():
            print(f"  {count:4d}  {author}")

    # 3. Publishers
    if "publisher" in col_map:
        pc = col_map["publisher"]
        publishers = df[pc].dropna().str.strip()
        pub_counts = publishers.value_counts().head(20)
        print(f"\n3. TOP PUBLISHERS (top 20)")
        print("-" * 50)
        for pub, count in pub_counts.items():
            print(f"  {count:4d}  {pub}")

    # 4. Countries
    if "country" in col_map:
        cc = col_map["country"]
        countries = df[cc].dropna().str.strip()
        country_counts = countries.value_counts()
        print(f"\n4. COUNTRIES PUBLISHING LATIN→ENGLISH TRANSLATIONS")
        print("-" * 50)
        for country, count in country_counts.items():
            print(f"  {count:4d}  {country}")

    # 5. Title/subject patterns
    if "title" in col_map:
        tc = col_map["title"]
        titles = df[tc].dropna().str.lower()

        categories = {
            "Religious/Theological": [
                "bible", "church", "christian", "catholic", "prayer",
                "saint", "gospel", "psalm", "liturgy", "theology",
                "divine", "sacred", "holy", "mass", "sermon",
                "confess", "monast", "benedict", "aquinas", "augustin",
            ],
            "Classical/Ancient": [
                "cicero", "virgil", "ovid", "horace", "seneca",
                "pliny", "tacitus", "caesar", "livy", "catullus",
                "lucretius", "juvenal", "martial", "sallust", "suetonius",
                "aeneid", "metamorphos", "republic", "iliad",
            ],
            "Medical/Scientific": [
                "medic", "anatomy", "physic", "natur", "botan",
                "chemi", "astron", "mathematic", "scienti", "herbal",
                "disease", "remedy", "cure", "pharma",
            ],
            "Legal/Political": [
                "law", "legal", "juris", "right", "constit",
                "govern", "politi", "state", "republic", "civil",
            ],
            "Philosophy": [
                "philos", "ethic", "logic", "metaphys", "reason",
                "mind", "soul", "virtue", "wisdom",
            ],
            "Hermetic/Esoteric": [
                "hermet", "alchem", "occult", "magic", "cabala",
                "kabbala", "mystic", "esoteric", "rosicruc", "secret",
                "arcana", "thrice", "emerald", "trismegist",
            ],
            "Historical": [
                "histor", "chronicle", "war", "empire", "king",
                "dynasty", "reign", "antiquit",
            ],
        }

        print(f"\n5. SUBJECT CATEGORIES (keyword-based classification)")
        print("-" * 50)
        categorized = {}
        uncategorized = 0
        for _, title in titles.items():
            found = False
            for cat, keywords in categories.items():
                if any(kw in title for kw in keywords):
                    categorized.setdefault(cat, 0)
                    categorized[cat] += 1
                    found = True
                    break
            if not found:
                uncategorized += 1

        for cat, count in sorted(categorized.items(), key=lambda x: -x[1]):
            pct = count / len(titles) * 100
            print(f"  {count:4d} ({pct:5.1f}%)  {cat}")
        pct_unc = uncategorized / len(titles) * 100
        print(f"  {uncategorized:4d} ({pct_unc:5.1f}%)  Uncategorized")

    # 6. Re-translation analysis: same source work translated multiple times
    if "author" in col_map and "title" in col_map:
        tc = col_map["title"]
        ac = col_map["author"]

        # Use original title if available, otherwise translated title
        otc = col_map.get("original_title", tc)

        # Normalize for grouping
        norm_title = (
            df[otc].fillna("").str.lower().str.strip()
            .str.replace(r"[^\w\s]", "", regex=True)
            .str.replace(r"\s+", " ", regex=True)
        )
        norm_author = (
            df[ac].fillna("").str.lower().str.strip()
            .str.replace(r"[^\w\s]", "", regex=True)
            .str.replace(r"\s+", " ", regex=True)
        )

        df["_work_key"] = norm_author + " | " + norm_title
        retrans = df.groupby("_work_key").size()
        multi_trans = retrans[retrans > 1].sort_values(ascending=False)

        print(f"\n6. RE-TRANSLATIONS (same source work translated multiple times)")
        print("-" * 50)
        print(f"  Unique source works: {len(retrans)}")
        print(f"  Works with multiple translations: {len(multi_trans)}")
        if len(multi_trans) > 0:
            print(f"  Most re-translated works:")
            for work, count in multi_trans.head(30).items():
                # Get the original (un-normalized) title from first occurrence
                sample = df[df["_work_key"] == work].iloc[0]
                author = sample[ac] if pd.notna(sample[ac]) else "Unknown"
                title = sample[otc] if pd.notna(sample[otc]) else sample[tc]
                print(f"    {count:3d}x  {author} - {title}")

            # Show year spread for the most re-translated works
            if "year" in col_map:
                print(f"\n  Year ranges for top re-translated works:")
                for work, count in multi_trans.head(10).items():
                    work_rows = df[df["_work_key"] == work]
                    sample = work_rows.iloc[0]
                    author = sample[ac] if pd.notna(sample[ac]) else "Unknown"
                    yc = col_map["year"]
                    if work_rows[yc].dtype == "object":
                        work_years = pd.to_datetime(work_rows[yc], errors="coerce").dt.year
                    else:
                        work_years = work_rows[yc]
                    work_years = work_years.dropna().sort_values()
                    year_list = ", ".join(str(int(y)) for y in work_years)
                    print(f"    {author}: {year_list}")

        df.drop(columns=["_work_key"], inplace=True)

    # 7. Cross-reference with Second Renaissance project
    print(f"\n7. RELEVANCE TO SECOND RENAISSANCE PROJECT")
    print("-" * 50)
    print(f"  Total unique translations found: {len(df)}")
    if "year" in col_map:
        modern = years.between(1979, 2008).sum()
        print(f"  Modern translations (1979-2008): {modern}")
    print("  Note: The Index Translationum covers 1979-2008.")
    print("  The Second Renaissance focuses on 1450-1700 Latin works,")
    print("  so this data shows which of those works have modern translations.")

    # Save analysis summary as JSON
    if output_dir:
        summary = {
            "total_records": len(df),
            "columns": list(df.columns),
        }
        if "year" in col_map:
            summary["yearly_counts"] = {
                str(int(k)): int(v) for k, v in yearly.items()
            }
            summary["peak_year"] = int(peak_year)
        if "author" in col_map:
            summary["top_authors"] = {
                k: int(v) for k, v in author_counts.head(50).items()
            }
        if categorized:
            summary["subject_categories"] = categorized

        summary_path = Path(output_dir) / "unesco_latin_english_analysis.json"
        with open(summary_path, "w") as f:
            json.dump(summary, f, indent=2)
        print(f"\n  Analysis summary saved to {summary_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Download UNESCO Index Translationum data for Latin→English translations"
    )
    parser.add_argument(
        "--schema", action="store_true",
        help="Show dataset schema and exit"
    )
    parser.add_argument(
        "--source-lang", default="Latin",
        help="Source (original) language (default: Latin)"
    )
    parser.add_argument(
        "--target-lang", default="English",
        help="Target language (default: English)"
    )
    parser.add_argument(
        "--output-dir", default="data/unesco",
        help="Output directory (default: data/unesco)"
    )
    parser.add_argument(
        "--discover", action="store_true",
        help="Auto-discover field names from sample records"
    )
    parser.add_argument(
        "--download-all", action="store_true",
        help="Download entire dataset (no language filter)"
    )
    parser.add_argument(
        "--src-field", default=None,
        help="Override source language field name"
    )
    parser.add_argument(
        "--tgt-field", default=None,
        help="Override target language field name"
    )
    parser.add_argument(
        "--analyze", default=None, metavar="CSV_FILE",
        help="Analyze patterns in a previously downloaded CSV file"
    )
    parser.add_argument(
        "--no-dedup", action="store_true",
        help="Skip deduplication"
    )
    args = parser.parse_args()

    # Offline analysis mode
    if args.analyze:
        print("UNESCO Index Translationum - Pattern Analysis")
        print("=" * 60)
        filepath = Path(args.analyze)
        if not filepath.exists():
            print(f"Error: File not found: {filepath}")
            sys.exit(1)
        df = pd.read_csv(filepath)
        print(f"Loaded {len(df)} records from {filepath}")

        if not args.no_dedup:
            df, duplicates = deduplicate_records(df)
            if len(duplicates) > 0:
                dup_path = filepath.parent / (filepath.stem + "_duplicates.csv")
                duplicates.to_csv(dup_path, index=False)
                print(f"Duplicates saved to {dup_path}")

        analyze_patterns(df, output_dir=filepath.parent)
        return

    print("UNESCO Index Translationum - Translation Dataset Downloader")
    print("=" * 60)

    api_base = get_api_base()

    # Schema mode
    if args.schema:
        fetch_schema(api_base)
        print()
        discover_language_fields(api_base)
        return

    # Discovery mode
    if args.discover:
        print("\nDiscovering dataset structure...")
        fields = fetch_schema(api_base)
        print()
        sample = discover_language_fields(api_base)
        if sample:
            find_language_field_names(sample)
        print("\nTrying field name combinations...")
        try_field_names(api_base, args.source_lang, args.target_lang)
        return

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.download_all:
        # Download entire dataset via bulk CSV export (no row limit)
        filepath = output_dir / "unesco_tran001_full.csv"
        print("\nDownloading entire dataset via bulk CSV export...")
        print("  (The /exports/csv endpoint has no row limit, unlike /records)")
        try:
            df = download_full_csv(api_base, filepath)
        except requests.RequestException as e:
            print(f"\n  Bulk CSV export failed: {e}")
            print("  Falling back to paginated JSON API...")
            records = fetch_all_records(api_base)
            if not records:
                print("No records returned from either method.")
                return
            df = export_csv(records, filepath)

        if df is None or len(df) == 0:
            print("No data downloaded.")
            return

        # Filter locally for Latin → English
        print(f"\nSearching for {args.source_lang} → {args.target_lang} in downloaded data...")
        lang_cols = [c for c in df.columns if any(
            term in c.lower() for term in ["lang", "language", "original", "target"]
        )]
        print(f"Potential language columns: {lang_cols}")

        for col in df.columns:
            vals = df[col].dropna().astype(str).str.lower().unique()
            has_latin = any("latin" in v for v in vals)
            has_english = any("english" in v for v in vals)
            if has_latin:
                print(f"  Column '{col}' contains 'latin' values!")
            if has_english:
                print(f"  Column '{col}' contains 'english' values!")

        # Attempt local filtering
        src_col = None
        tgt_col = None
        for col in df.columns:
            vals = df[col].dropna().astype(str).str.lower().unique()
            if any("latin" in v for v in vals):
                if src_col is None:
                    src_col = col
            if any("english" in v for v in vals):
                if tgt_col is None:
                    tgt_col = col

        if src_col and tgt_col:
            mask = (
                df[src_col].astype(str).str.lower().str.contains("latin", na=False)
                & df[tgt_col].astype(str).str.lower().str.contains("english", na=False)
            )
            filtered = df[mask]
            slug_src = args.source_lang.lower()
            slug_tgt = args.target_lang.lower()
            filtered_path = output_dir / f"unesco_{slug_src}_to_{slug_tgt}_translations.csv"
            filtered.to_csv(filtered_path, index=False)
            print(f"\nFiltered {len(filtered)} Latin→English records → {filtered_path}")

            if not args.no_dedup:
                filtered, duplicates = deduplicate_records(filtered)
                if len(duplicates) > 0:
                    dup_path = output_dir / f"unesco_{slug_src}_to_{slug_tgt}_duplicates.csv"
                    duplicates.to_csv(dup_path, index=False)

            analyze_patterns(filtered, output_dir=str(output_dir))
        else:
            print("\nCould not auto-detect language columns for local filtering.")
            print("Inspect the full CSV and re-run with --analyze.")
        return

    # Try to find the right field names
    print(f"\nSearching for {args.source_lang} → {args.target_lang} translations...")

    if args.src_field and args.tgt_field:
        lang_fields = (args.src_field, args.tgt_field)
        total = None
    else:
        print("Auto-detecting language field names...")
        lang_fields, total = try_field_names(api_base, args.source_lang, args.target_lang)

    if not lang_fields:
        print("\nCould not auto-detect field names.")
        print("Try running with --schema or --discover to inspect the dataset,")
        print("or use --download-all to download everything and filter locally.")
        print("\nAlternatively, specify fields manually:")
        print("  --src-field original_language --tgt-field target_language")
        return

    # Build query and fetch
    where = build_where_clause(
        args.source_lang, args.target_lang,
        lang_fields=lang_fields,
    )
    print(f"\nQuery: {where}")

    slug_src = args.source_lang.lower()
    slug_tgt = args.target_lang.lower()
    filepath = output_dir / f"unesco_{slug_src}_to_{slug_tgt}_translations.csv"

    # Try bulk CSV export first (no row limit), fall back to paginated JSON
    print("Downloading via bulk CSV export...")
    try:
        df = download_full_csv(api_base, filepath, where_clause=where)
    except requests.RequestException as e:
        print(f"  Bulk export failed: {e}")
        print("  Falling back to paginated JSON API...")
        records = fetch_all_records(api_base, where_clause=where)
        if not records:
            print("No records found. Try --discover to inspect the dataset.")
            return
        df = export_csv(records, filepath)

    if df is None or len(df) == 0:
        print("No records found. Try --discover to inspect the dataset.")
        return

    # Deduplicate
    if not args.no_dedup:
        df, duplicates = deduplicate_records(df)
        if len(duplicates) > 0:
            deduped_path = output_dir / f"unesco_{slug_src}_to_{slug_tgt}_deduped.csv"
            df.to_csv(deduped_path, index=False)
            print(f"Deduplicated data saved to {deduped_path}")

            dup_path = output_dir / f"unesco_{slug_src}_to_{slug_tgt}_duplicates.csv"
            duplicates.to_csv(dup_path, index=False)
            print(f"Removed duplicates saved to {dup_path}")

    # Analyze patterns
    analyze_patterns(df, output_dir=str(output_dir))

    # Group by year and summarize
    print("\n" + "=" * 60)
    print(f"Books translated from {args.source_lang} to {args.target_lang} by year:")
    print("-" * 60)

    # Find the year column
    year_col = None
    for col in df.columns:
        if "year" in col.lower() or "date" in col.lower() or "time" in col.lower():
            year_col = col
            break

    if year_col:
        # Extract year if it's a date field
        if df[year_col].dtype == "object":
            df["_year"] = pd.to_datetime(df[year_col], errors="coerce").dt.year
            df["_year"] = df["_year"].fillna(df[year_col])
        else:
            df["_year"] = df[year_col]

        yearly = df.groupby("_year").size().sort_index()
        for year, count in yearly.items():
            print(f"  {year}: {count} books")

        print(f"\nTotal: {yearly.sum()} books across {len(yearly)} years")

        # Export yearly summary
        summary_path = output_dir / f"unesco_{slug_src}_to_{slug_tgt}_by_year.csv"
        yearly.to_frame("count").to_csv(summary_path)
        print(f"Yearly summary saved to {summary_path}")
    else:
        print("Could not find a year/date column to group by.")
        print(f"Available columns: {list(df.columns)}")


if __name__ == "__main__":
    main()
