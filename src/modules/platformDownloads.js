const REPO = 'Sorakiel/almanac';

function pickAsset(assets, patterns) {
  for (const pattern of patterns) {
    const found = assets.find((a) => pattern.test(a.name));
    if (found) return found.browser_download_url;
  }
  return null;
}

/**
 * Every download button in the install modal ships with a working default href
 * (the releases page) so it's never broken. This upgrades them, when possible,
 * to a direct link straight to the current release's actual installer file —
 * fetched live from the GitHub API, so it tracks whatever the newest release is
 * without needing to hardcode a version anywhere.
 */
export async function initPlatformDownloads() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!res.ok) return;
    const data = await res.json();
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
  } catch {
    // Network error or GitHub API rate limit — the release-page fallback hrefs
    // already in the HTML still work, just with one extra click.
  }
}
