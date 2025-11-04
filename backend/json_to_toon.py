#!/usr/bin/env python3
"""
json_to_toon.py — Full optimized converter between JSON and TOON formats.
Author: Sohrab Musa
"""

import argparse
import sys
import json
from typing import Any
from pathlib import Path

try:
    import orjson as jsonlib
except ImportError:
    jsonlib = json


# ------------------------------
# Helpers
# ------------------------------

def load_json(text: str) -> Any:
    """Robust JSON loader: supports NDJSON, BOM, multiple objects."""
    text = text.strip().lstrip("\ufeff")
    if not text:
        raise ValueError("Empty input.")
    try:
        return jsonlib.loads(text)
    except Exception:
        # try NDJSON or concatenated
        docs = []
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                docs.append(jsonlib.loads(line))
            except Exception as e:
                raise ValueError(f"Invalid JSON line: {line[:100]} ({e})")
        if len(docs) == 1:
            return docs[0]
        return docs


def extract_root(data: Any, root: str) -> Any:
    """Navigate nested dict using dotted path (e.g., 'data.items.0')."""
    node = data
    for part in root.split("."):
        if isinstance(node, list):
            node = node[int(part)]
        elif isinstance(node, dict):
            node = node.get(part)
        else:
            raise KeyError(f"Invalid root path at '{part}'")
    return node


def coerce_value(val: Any):
    """Convert strings like '123' -> int, 'true' -> bool, 'null' -> None."""
    if isinstance(val, str):
        low = val.lower()
        if low == "true":
            return True
        if low == "false":
            return False
        if low == "null":
            return None
        try:
            if "." in val:
                return float(val)
            return int(val)
        except Exception:
            return val
    return val


def coerce_data(data: Any):
    """Recursively coerce all string values."""
    if isinstance(data, list):
        return [coerce_data(x) for x in data]
    elif isinstance(data, dict):
        return {k: coerce_data(v) for k, v in data.items()}
    else:
        return coerce_value(data)


# ------------------------------
# TOON Encoding / Decoding
# ------------------------------

def to_toon(data: Any, indent: int = 0, level: int = 0,
            delimiter: str = ",", length_marker: bool = False) -> str:
    """Recursively convert Python objects into TOON-style format."""
    pad = " " * (level * indent)
    lines = []
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, (dict, list)):
                marker = ""
                if isinstance(v, list) and length_marker:
                    marker = f"[{len(v)},]"
                lines.append(f"{pad}{k}{marker}:")
                lines.append(to_toon(v, indent, level + 1, delimiter, length_marker))
            else:
                lines.append(f"{pad}{k}: {json.dumps(v, ensure_ascii=False)}")
    elif isinstance(data, list):
        if not data:
            lines.append(f"{pad}[]")
        else:
            if all(isinstance(x, dict) for x in data):
                headers = list(data[0].keys())
                lines.append(f"{pad}{{{delimiter.join(headers)}}}:")
                for row in data:
                    rowvals = [
                        json.dumps(row.get(h, ""), ensure_ascii=False)
                        for h in headers
                    ]
                    lines.append(f"{pad}{' ' * indent}{delimiter.join(rowvals)}")
            else:
                for x in data:
                    lines.append(f"{pad}- {json.dumps(x, ensure_ascii=False)}")
    else:
        lines.append(f"{pad}{json.dumps(data, ensure_ascii=False)}")
    return "\n".join(lines)


def toon_to_json(text: str) -> Any:
    """Very simple parser for TOON -> JSON (best-effort)."""
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip()]
    root = {}
    stack = [(0, root)]
    for line in lines:
        stripped = line.lstrip()
        level = len(line) - len(stripped)
        while stack and level < stack[-1][0]:
            stack.pop()
        parent = stack[-1][1]
        if ":" in stripped:
            key, val = stripped.split(":", 1)
            key, val = key.strip(), val.strip()
            if not val:
                node = {}
                parent[key] = node
                stack.append((level + 1, node))
            else:
                try:
                    parent[key] = json.loads(val)
                except Exception:
                    parent[key] = val
    return root


# ------------------------------
# CLI entry
# ------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Convert between JSON and TOON formats."
    )
    parser.add_argument("input", help="Input file (or - for stdin)")
    parser.add_argument("-o", "--output", help="Output file")
    parser.add_argument("--mode", choices=["json2toon", "toon2json"], default="json2toon")
    parser.add_argument("--root", help="Dotted path to nested key for conversion")
    parser.add_argument("--indent", type=int, default=2)
    parser.add_argument("--delimiter", choices=["comma", "tab", "pipe"], default="comma")
    parser.add_argument("--length-marker", action="store_true")
    parser.add_argument("--coerce", action="store_true")
    parser.add_argument("--pretty", action="store_true")
    parser.add_argument("--ensure-ascii", action="store_true")

    args = parser.parse_args()

    # Read input
    if args.input == "-":
        text = sys.stdin.read()
    else:
        text = Path(args.input).read_text(encoding="utf-8")

    # Conversion
    if args.mode == "json2toon":
        data = load_json(text)
        if args.root:
            data = extract_root(data, args.root)
        if args.coerce:
            data = coerce_data(data)
        delimiter = {"comma": ",", "tab": "\t", "pipe": "|"}[args.delimiter]
        output = to_toon(data, indent=args.indent, delimiter=delimiter,
                         length_marker=args.length_marker)
    else:  # toon2json
        data = toon_to_json(text)
        output = json.dumps(
            data,
            indent=(args.indent if args.pretty else None),
            ensure_ascii=args.ensure_ascii,
        )

    # Write or print
    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
    else:
        print(output)


if __name__ == "__main__":
    main()
