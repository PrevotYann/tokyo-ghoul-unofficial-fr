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
    "body": "Première traduction française pour Foundry VTT 14.368 et Tokyo Ghoul 0.2.1.\n\n312 clés d’interface et 83 entrées de compendium couvertes. Les identifiants mécaniques sont conservés.\n\nInstallation : collez l’URL de module.json dans Installer un module, activez le module et choisissez Français.\n\nManifeste : " + manifest["manifest"],
    "draft": False, "prerelease": False
})
upload = release["upload_url"].split("{")[0]
for filename, content_type in [("module.json", "application/json"), ("manifest.json", "application/json"), (manifest["id"] + ".zip", "application/zip")]:
    api(upload + "?name=" + filename, (root / "dist" / filename).read_bytes(), "POST", content_type)
print("Published " + release["html_url"])
