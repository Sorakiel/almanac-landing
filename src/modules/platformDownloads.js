const REPO = 'Sorakiel/almanac';
const CACHE_KEY = 'almanac-release-cache-v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // releases don't ship more often than this

function pickAsset(assets, patterns) {
  for (const pattern of patterns) {
    const found = assets.find((a) => pattern.test(a.name));
    if (found) return found.browser_download_url;
  }
  return null;
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Storage full or unavailable (private browsing) — caching is an optimization, not a requirement.
  }
}

function applyRelease(data) {
  const assets = data.assets || [];
  const links = {
    dlAndroid: pickAsset(assets, [/\.apk$/i]),
    dlWindows: pickAsset(assets, [/setup\.exe$/i, /\.exe$/i, /\.msi$/i]),
    dlMac: pickAsset(assets, [/\.dmg$/i]),
    dlLinux: pickAsset(assets, [/\.AppImage$/i]),
  };

  Object.entries(links).forEach(([id, url]) => {
    if (!url) return;
    const btn = document.getElementById(id);
    if (btn) btn.href = url;
  });

  if (data.tag_name) {
    document.querySelectorAll('[data-release-version]').forEach((el) => {
      el.textContent = data.tag_name.replace(/^v/, '');
    });
  }
}

/**
 * Every download button in the install modal ships with a working default href
 * (the releases page) so it's never broken. This upgrades them, when possible,
 * to a direct link straight to the current release's actual installer file —
 * fetched live from the GitHub API, so it tracks whatever the newest release is
 * without needing to hardcode a version anywhere.
 *
 * Cached in sessionStorage for an hour: GitHub's unauthenticated API is capped
 * at 60 requests/hour per IP, shared across every visitor behind the same NAT —
 * refetching on every reload risked tripping that for no benefit, since releases
 * don't ship anywhere near that often.
 */
export async function initPlatformDownloads() {
  const cached = readCache();
  if (cached) {
    applyRelease(cached);
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!res.ok) return;
    const data = await res.json();
    writeCache(data);
    applyRelease(data);
  } catch {
    // Network error or GitHub API rate limit — the release-page fallback hrefs
    // already in the HTML still work, just with one extra click.
  }
}
