import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.org.glossary.socialwork",
  appName: "Social Work Glossary",
  webDir: "www",

  android: {
    // The glossary is a reading app; letting the webview zoom the whole page
    // would fight the reading-size control on the entry screen.
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 600,
      backgroundColor: "#0d5fbe",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
