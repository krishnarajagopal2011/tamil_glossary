import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Glossary, type UpdateStore } from "@/lib/dataset/source";

/**
 * The app's copy of the glossary.
 *
 * Everything is read from `dataset/`, which ships inside the APK, so the app
 * opens with no network at all. Anything an admin build later downloads is
 * written to the device's data directory and read in preference to the
 * bundled file — see `Glossary.sync`.
 */
const UPDATE_DIR = "dataset";

const store: UpdateStore = {
  async read(file) {
    try {
      const { data } = await Filesystem.readFile({
        path: UPDATE_DIR + "/" + file,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      return typeof data === "string" ? data : null;
    } catch {
      // Nothing downloaded for this file yet: the bundled copy stands.
      return null;
    }
  },

  async write(file, body) {
    await Filesystem.writeFile({
      path: UPDATE_DIR + "/" + file,
      data: body,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      recursive: true,
    });
  },

  async clear() {
    await Filesystem.rmdir({
      path: UPDATE_DIR,
      directory: Directory.Data,
      recursive: true,
    }).catch(() => {});
  },
};

export const glossary = new Glossary({ baseUrl: "dataset", store });

/**
 * Where a future admin build would look for newer content. Left unset in the
 * shipped app, which never touches the network.
 */
export const UPDATE_ORIGIN: string | null =
  import.meta.env.VITE_UPDATE_ORIGIN ?? null;
