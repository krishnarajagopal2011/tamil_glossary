/**
 * Identity shared by the website's phone view and the packaged Android build.
 * The version is shown in the drawer and is what a reader quotes when they
 * report a mistake in an entry, so keep it in step with the Play Store release.
 */
export const APP_VERSION = "v3.0";

export const APP_NAME = "Social Work Glossary";

export const APP_NAME_TA = "சமூகப்பணி கலைச்சொல் அகராதி";

/** Where the author publishes; shown in the drawer and the about screen. */
export const AUTHOR_SITE = "https://glossary.org.in";

/** Ekalai Software Solutions, who built the original Android edition. */
export const SOFTWARE_SITE = "https://www.ekalai.com";

/** Where readers write for support and to report a mistake in an entry. */
export const CONTACT_EMAIL = "admin@dverselabs.com";

/** Matches --app-bar in globals.css; used for the browser and status bars. */
export const APP_BAR_COLOR = "#0d5fbe";

/**
 * Where a shared entry resolves.
 *
 * The packaged app has no address of its own — everything it shows is read
 * from a file on the device — so a shared link has to point at the website.
 * The website itself prefers NEXT_PUBLIC_SITE_URL, which is what makes the
 * links correct on a preview deployment as well as in production.
 *
 * Changing this needs a new APK release: it is compiled into the app. When
 * glossary.org.in is pointed at the deployment, change it here, rebuild, and
 * ship — old installs keep sharing vercel.app links until they update.
 */
export const PUBLIC_SITE_URL = "https://tamil-glossary.vercel.app";

export function termUrl(slug: string): string {
  const configured =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_SITE_URL
      : undefined;
  return (configured || PUBLIC_SITE_URL).replace(/\/$/, "") + "/term/" + slug;
}
