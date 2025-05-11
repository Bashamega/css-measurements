import { get } from "http";
import { inc } from "semver";
import type { ReleaseType } from "semver";

export async function getVersion(
  packageName: string,
  bumpType: ReleaseType = "patch",
): Promise<string> {
  return new Promise<string>((resolve) => {
    const request = get(`http://registry.npmjs.org/${packageName}`, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (!data) {
            console.error(`Empty response for package: ${packageName}`);
            resolve("0.0.1");
            return;
          }

          const json = JSON.parse(data);

          if (!json["dist-tags"]?.latest) {
            console.error(
              `No 'latest' version found for package: ${packageName}`,
            );
            resolve("0.0.1");
            return;
          }

          const latestVersion = json["dist-tags"].latest;
          const bumpedVersion = inc(latestVersion, bumpType);

          if (bumpedVersion) {
            resolve(bumpedVersion);
          } else {
            resolve("0.0.1");
          }
        } catch (error) {
          console.error(
            `Error parsing JSON for package ${packageName}:`,
            error,
          );
          console.error(`Received response: ${data}`); // Log the raw data for debugging
          resolve("0.0.1");
        }
      });
    });

    // Handle network errors or timeouts
    request.on("error", (err) => {
      console.error(`HTTP request error for package ${packageName}:`, err);
      resolve("0.0.1");
    });
  });
}
