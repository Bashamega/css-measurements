import { get as httpsGet, RequestOptions } from "https";
import { inc } from "semver";
import type { ReleaseType } from "semver";

export async function getVersion(
  packageName: string,
  bumpType: ReleaseType = "patch",
  timeoutMs = 10_000,
): Promise<string> {
  const options: RequestOptions = {
    host: "registry.npmjs.org",
    path: `/${encodeURIComponent(packageName)}`,
    method: "GET",
    timeout: timeoutMs,
    headers: {
      "Accept": "application/vnd.npm.install-v1+json",
      "User-Agent": "npm-version-helper",
    },
  };

  return new Promise<string>((resolve) => {
    const req = httpsGet(options, (res) => {
      if (res.statusCode !== 200) {
        console.error(
          `Registry responded with ${res.statusCode} for ${packageName}`,
        );
        res.resume(); // Drain the socket.
        return resolve("0.0.1");
      }

      let raw = "";
      res.setEncoding("utf8");

      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(raw);
          const latest = json?.["dist-tags"]?.latest;

          if (!latest) {
            console.error(`No 'latest' tag for ${packageName}`);
            return resolve("0.0.1");
          }

          const next = inc(latest, bumpType) ?? "0.0.1";
          return resolve(next);
        } catch (e) {
          console.error(`Failed to parse registry response for ${packageName}`, e);
          console.error("Raw response:", raw);
          return resolve("0.0.1");
        }
      });
    });

    req.on("error", (err) => {
      console.error(`HTTPS request error for ${packageName}:`, err);
      resolve("0.0.1");
    });

    req.on("timeout", () => {
      console.error(`Request timed out for ${packageName}`);
      req.destroy();
      resolve("0.0.1");
    });
  });
}
