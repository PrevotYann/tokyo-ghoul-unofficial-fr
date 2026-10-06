"""Explicitly publish the checked-out module to the owner's public GitHub repository."""
import json
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "module.json").read_text(encoding="utf-8"))
repo = "PrevotYann/tokyo-ghoul-unofficial-fr"
tag = "v" + manifest["version"]
artifacts = [("module.json", "application/json"), ("manifest.json", "application/json"), (manifest["id"] + ".zip", "application/zip")]
for filename, _ in artifacts:
    if not (root / "dist" / filename).is_file():
        raise SystemExit("Missing release artifact: " + filename)
for filename in ("module.json", "manifest.json"):
    if json.loads((root / "dist" / filename).read_text(encoding="utf-8")) != manifest:
        raise SystemExit("Stale release manifest: " + filename)
changelog = (root / "CHANGELOG.md").read_text(encoding="utf-8")
section = next((section for section in changelog.split("\n## ")[1:] if section.startswith(manifest["version"] + " ")), None)
if section is None:
    raise SystemExit("Missing changelog for " + tag)
notes = section.split("\n", 1)[1].strip() + "\n\nManifeste Foundry : " + manifest["manifest"]
credentials = subprocess.run(["git", "credential", "fill"], input="protocol=https\nhost=github.com\n\n", text=True, capture_output=True, check=True)
values = dict(line.split("=", 1) for line in credentials.stdout.splitlines() if "=" in line)
headers = {"Authorization": "Bearer " + values["password"], "Accept": "application/vnd.github+json", "User-Agent": manifest["id"], "X-GitHub-Api-Version": "2022-11-28"}

def api(path, data=None, method=None, content_type="application/json"):
    url = path if path.startswith("https://") else "https://api.github.com" + path
    body = data if isinstance(data, bytes) else json.dumps(data).encode() if data is not None else None
    request = urllib.request.Request(url, data=body, method=method, headers={**headers, "Content-Type": content_type})
    with urllib.request.urlopen(request) as response:
        return json.load(response)

if api("/user")["login"].lower() != "prevotyann":
    raise SystemExit("Authenticated account is not PrevotYann")
try:
    existing = api("/repos/" + repo)
    if existing["private"]:
        raise SystemExit("Existing repository is private; refusing to change its visibility implicitly")
except urllib.error.HTTPError as error:
    if error.code != 404:
        raise
    api("/user/repos", {"name": manifest["id"], "description": "Traduction française du système Tokyo Ghoul pour Foundry VTT v14", "private": False, "auto_init": False})

def git(*args):
    return subprocess.run(["git", *args], cwd=root, check=True)

if not (root / ".git").exists():
    git("init", "-b", "main")
    git("remote", "add", "origin", "https://github.com/" + repo + ".git")
remote = subprocess.run(["git", "remote", "get-url", "origin"], cwd=root, text=True, capture_output=True, check=True).stdout.strip()
if remote != "https://github.com/" + repo + ".git":
    raise SystemExit("Unexpected origin: " + remote)
git("add", ".")
if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=root).returncode:
    git("commit", "-m", "Release French translation " + tag + " for Foundry VTT 14.368")
git("push", "-u", "origin", "main")
if subprocess.run(["git", "rev-parse", "--verify", "refs/tags/" + tag], cwd=root, capture_output=True).returncode:
    git("tag", "-a", tag, "-m", "Tokyo Ghoul : traduction française " + tag)
git("push", "origin", tag)
release = api("/repos/" + repo + "/releases", {
    "tag_name": tag, "name": "Tokyo Ghoul : traduction française " + tag,
    "body": notes,
    "draft": True, "prerelease": False
})
upload = release["upload_url"].split("{")[0]
for filename, content_type in artifacts:
    api(upload + "?name=" + filename, (root / "dist" / filename).read_bytes(), "POST", content_type)
release = api("/repos/" + repo + "/releases/" + str(release["id"]), {"draft": False, "make_latest": "true"}, "PATCH")
print("Published " + release["html_url"])
