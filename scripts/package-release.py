"""Build an installable ZIP with module.json at the package folder root."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "module.json").read_text(encoding="utf-8"))
dist = root / "dist"
dist.mkdir(exist_ok=True)
for filename in ("module.json", "manifest.json"):
    (dist / filename).write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
with ZipFile(dist / f'{manifest["id"]}.zip', "w", ZIP_DEFLATED) as archive:
    for name in ("module.json", "README.md", "CHANGELOG.md", "docs", "lang", "src", "styles"):
        entry = root / name
        for file in ([entry] if entry.is_file() else sorted(entry.rglob("*"))):
            if file.is_file():
                archive.write(file, f'{manifest["id"]}/{file.relative_to(root).as_posix()}')
print(f'Packaged {manifest["id"]} v{manifest["version"]}')
