#!/usr/bin/env python3
"""
Deterministic Ecommerce Source Assembler.

- Clones configured public GitHub repositories into ./sources
- Captures commit SHAs and basic project metadata
- Enforces a license gate before code import
- Supports dry-run and real assembly
- Selectively copies only configured paths
- Applies explicit deterministic text transformations
- Never copies .env files or known secret files
- Produces audit reports
- Optionally runs npm install/typecheck/lint/build
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parent
SOURCES = ROOT / "sources"
DOCS = ROOT / "docs"
DEFAULT_CONFIG = ROOT / "assembly_config.json"

IGNORED_NAMES = {
    ".env", ".env.local", ".env.production", ".env.development",
    ".env.test", "node_modules", ".next", "dist", "build", ".git"
}


@dataclass
class RepoInfo:
    name: str
    url: str
    path: str
    license_status: str = "unverified"
    license_file: str | None = None
    commit_sha: str | None = None
    package_manager: str | None = None
    framework: str | None = None
    env_names: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def log(message: str) -> None:
    print(f"[assembler] {message}")


def fail(message: str, code: int = 1) -> None:
    print(f"[assembler] ERROR: {message}", file=sys.stderr)
    raise SystemExit(code)


def run(command: list[str], cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=str(cwd) if cwd else None,
        text=True,
        capture_output=True,
        check=check,
    )


def load_config(path: Path) -> dict:
    if not path.exists():
        fail(f"Config file not found: {path}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {path}: {exc}")


def clone_repo(name: str, url: str, refresh: bool = False) -> Path:
    SOURCES.mkdir(parents=True, exist_ok=True)
    target = SOURCES / re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-")

    if target.exists():
        if not (target / ".git").exists():
            fail(f"{target} exists but is not a Git repository.")
        if refresh:
            log(f"Refreshing {name}")
            run(["git", "fetch", "--all", "--tags"], cwd=target)
            run(["git", "pull", "--ff-only"], cwd=target)
        return target

    log(f"Cloning {name}")
    run(["git", "clone", url, str(target)])
    return target


def git_sha(repo_path: Path) -> str | None:
    try:
        return run(["git", "rev-parse", "HEAD"], cwd=repo_path).stdout.strip()
    except subprocess.CalledProcessError:
        return None


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def detect_license(repo_path: Path) -> tuple[str, str | None]:
    candidates = ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "LICENCE.md", "COPYING"]
    for name in candidates:
        path = repo_path / name
        if not path.is_file():
            continue

        text = read_text(path).lower()
        if "mit license" in text or "permission is hereby granted" in text:
            return "MIT", str(path.relative_to(repo_path))
        if "apache license" in text:
            return "Apache-2.0", str(path.relative_to(repo_path))
        if "gnu general public license" in text:
            return "GPL", str(path.relative_to(repo_path))
        return "present-unclassified", str(path.relative_to(repo_path))

    return "unverified", None


def package_json(repo_path: Path) -> dict:
    path = repo_path / "package.json"
    if not path.exists():
        return {}
    try:
        return json.loads(read_text(path))
    except Exception:
        return {}


def detect_package_manager(repo_path: Path) -> str | None:
    if (repo_path / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (repo_path / "yarn.lock").exists():
        return "yarn"
    if (repo_path / "bun.lock").exists() or (repo_path / "bun.lockb").exists():
        return "bun"
    if (repo_path / "package-lock.json").exists():
        return "npm"
    if (repo_path / "package.json").exists():
        return "npm"
    return None


def detect_framework(repo_path: Path) -> str | None:
    data = package_json(repo_path)
    deps: dict = {}
    deps.update(data.get("dependencies", {}))
    deps.update(data.get("devDependencies", {}))

    if "next" in deps:
        return f"Next.js {deps['next']}"
    if "vite" in deps and "react" in deps:
        return f"React + Vite ({deps['react']})"
    if "react" in deps:
        return f"React ({deps['react']})"
    return None


def extract_env_names(repo_path: Path) -> list[str]:
    names: set[str] = set()

    for path in repo_path.rglob("*"):
        if not path.is_file():
            continue
        if any(part in IGNORED_NAMES for part in path.parts):
            continue

        if path.name in {".env.example", ".env.sample", ".env.template"}:
            for line in read_text(path).splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key = line.split("=", 1)[0].strip()
                if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", key):
                    names.add(key)

        if path.suffix in {".ts", ".tsx", ".js", ".jsx"}:
            text = read_text(path)
            names.update(re.findall(r"process\.env\.([A-Za-z_][A-Za-z0-9_]*)", text))
            names.update(re.findall(r"import\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)", text))

    return sorted(names)


def inspect_repo(name: str, url: str, refresh: bool = False) -> RepoInfo:
    path = clone_repo(name, url, refresh)
    license_status, license_file = detect_license(path)

    info = RepoInfo(
        name=name,
        url=url,
        path=str(path),
        license_status=license_status,
        license_file=license_file,
        commit_sha=git_sha(path),
        package_manager=detect_package_manager(path),
        framework=detect_framework(path),
        env_names=extract_env_names(path),
    )

    if license_status == "unverified":
        info.warnings.append("Code import blocked until a compatible license is explicitly approved.")
    return info


def inspect_all(config: dict, refresh: bool) -> list[RepoInfo]:
    return [
        inspect_repo(item["name"], item["url"], refresh)
        for item in config.get("repositories", [])
    ]


def find_repo(repos: Iterable[RepoInfo], name: str) -> RepoInfo:
    for repo in repos:
        if repo.name == name:
            return repo
    fail(f"Unknown source repository: {name}")
    raise AssertionError


def safe_relative(path: str) -> Path:
    p = Path(path)
    if p.is_absolute() or ".." in p.parts:
        fail(f"Unsafe path in configuration: {path}")
    return p


def copy_selected(source: Path, destination: Path) -> list[str]:
    copied: list[str] = []

    if not source.exists():
        fail(f"Configured source path does not exist: {source}")

    if source.is_file():
        if source.name.startswith(".env"):
            fail(f"Refusing to copy environment file: {source}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        return [str(destination.relative_to(ROOT))]

    for item in source.rglob("*"):
        if not item.is_file():
            continue
        if any(part in IGNORED_NAMES for part in item.parts):
            continue

        relative = item.relative_to(source)
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, target)
        copied.append(str(target.relative_to(ROOT)))

    return copied


def apply_transformations(config: dict, dry_run: bool) -> list[str]:
    changed: list[str] = []

    for rule in config.get("transformations", []):
        pattern = rule["file_glob"]
        replacements = rule.get("replacements", {})

        for path in ROOT.glob(pattern):
            if not path.is_file() or path.name.startswith(".env"):
                continue

            original = read_text(path)
            updated = original

            for old, new in replacements.items():
                updated = updated.replace(old, new)

            if updated != original:
                changed.append(str(path.relative_to(ROOT)))
                if not dry_run:
                    path.write_text(updated, encoding="utf-8")

    return changed


def write_env_example() -> None:
    content = """# Public
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=

# Server-only secrets
SUPABASE_SERVICE_ROLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
APP_SESSION_SECRET=
"""
    (ROOT / ".env.example").write_text(content, encoding="utf-8")


def write_reports(repos: list[RepoInfo], copied: list[str], changed: list[str]) -> None:
    DOCS.mkdir(parents=True, exist_ok=True)

    machine = {
        "repositories": [asdict(repo) for repo in repos],
        "copied_files": copied,
        "transformed_files": changed,
    }
    (DOCS / "ASSEMBLY_PLAN.json").write_text(
        json.dumps(machine, indent=2),
        encoding="utf-8",
    )

    lines = ["# Assembly Plan", ""]
    for repo in repos:
        lines += [
            f"## {repo.name}",
            f"- URL: {repo.url}",
            f"- Commit SHA: `{repo.commit_sha or 'unknown'}`",
            f"- License: `{repo.license_status}`",
            f"- License file: `{repo.license_file or 'not found'}`",
            f"- Package manager: `{repo.package_manager or 'unknown'}`",
            f"- Framework: `{repo.framework or 'unknown'}`",
            f"- Environment names: `{', '.join(repo.env_names) or 'none detected'}`",
            "",
        ]
        for warning in repo.warnings:
            lines.append(f"- WARNING: {warning}")
        lines.append("")

    lines += ["## Copied files", ""]
    lines += [f"- `{item}`" for item in copied] or ["- None"]

    lines += ["", "## Transformed files", ""]
    lines += [f"- `{item}`" for item in changed] or ["- None"]

    (DOCS / "ASSEMBLY_PLAN.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    attribution = [
        "# Source Attributions",
        "",
        "Preserve the applicable LICENSE/copyright notices required by imported sources.",
        "",
    ]
    for repo in repos:
        attribution.append(
            f"- {repo.name} — {repo.url} — license `{repo.license_status}` — commit `{repo.commit_sha or 'unknown'}`"
        )
    (DOCS / "SOURCE_ATTRIBUTIONS.md").write_text(
        "\n".join(attribution) + "\n",
        encoding="utf-8",
    )


def run_validation() -> int:
    package = ROOT / "package.json"
    if not package.exists():
        log("No root package.json; validation skipped.")
        return 0

    try:
        data = json.loads(read_text(package))
    except Exception:
        fail("Cannot parse root package.json")

    try:
        run(["npm", "install"], cwd=ROOT)
    except FileNotFoundError:
        log("npm is not installed; validation skipped.")
        return 0
    except subprocess.CalledProcessError as exc:
        print(exc.stdout)
        print(exc.stderr, file=sys.stderr)
        return 2

    for script in ("typecheck", "lint", "build"):
        if script not in data.get("scripts", {}):
            continue
        log(f"Running npm run {script}")
        try:
            run(["npm", "run", script], cwd=ROOT)
        except subprocess.CalledProcessError as exc:
            print(exc.stdout)
            print(exc.stderr, file=sys.stderr)
            return 2

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--assemble", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()

    if args.dry_run == args.assemble:
        fail("Choose exactly one: --dry-run or --assemble")

    config = load_config(args.config)
    repos = inspect_all(config, refresh=args.refresh)

    # Hard license gate before any source code copy.
    blocked = []
    approved_by_repo = {
        item["name"]: set(item.get("approved_licenses", []))
        for item in config.get("repositories", [])
    }

    for rule in config.get("copy_rules", []):
        if not rule.get("enabled", True):
            continue

        repo = find_repo(repos, rule["source_repo"])
        approved = approved_by_repo.get(repo.name, set())

        if repo.license_status not in approved:
            blocked.append(
                f"{repo.name}: detected license={repo.license_status}; "
                f"approved={sorted(approved)}"
            )

    if blocked and args.assemble:
        for message in blocked:
            log(f"BLOCKED: {message}")
        fail("Assembly blocked by unresolved license status.")

    copied: list[str] = []

    if args.assemble:
        for rule in config.get("copy_rules", []):
            if not rule.get("enabled", True):
                continue

            repo = find_repo(repos, rule["source_repo"])
            source = Path(repo.path) / safe_relative(rule["source"])
            destination = ROOT / safe_relative(rule["destination"])

            log(f"Copy: {repo.name}:{rule['source']} -> {rule['destination']}")
            copied.extend(copy_selected(source, destination))

    changed = apply_transformations(config, dry_run=not args.assemble)
    write_env_example()
    write_reports(repos, copied, changed)

    log(f"Repositories inspected: {len(repos)}")
    log(f"Files copied: {len(copied)}")
    log(f"Files transformed: {len(changed)}")
    log(f"Reports written to: {DOCS}")

    if args.validate and args.assemble:
        return run_validation()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())