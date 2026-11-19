/*
 * Document files, stored on this device in IndexedDB.
 *
 * LocalStorage is limited to a few MB of text, so the files themselves
 * (PDFs, photos of receipts) live in IndexedDB, which browsers allow to
 * hold hundreds of MB. Nothing is uploaded anywhere.
 *
 * Each record:
 *   { id, propertyId, docType, name, type, size, blob, createdAt,
 *     year?, note?, link? }
 * `link` ties a file to something else, e.g. { kind: "bill", year, billId }
 * for a quit rent receipt.
 *
 * Like the rest of Aequitas's data, these files stay on the device they
 * were added on. "Download backup" in Settings includes them.
 */

const DB_NAME = "aequitas-files";
const STORE = "files";
const VERSION = 1;

export const MAX_FILE_BYTES = 25 * 1024 * 1024;

/* Fired on window whenever files are added, changed or removed. */
export const FILES_CHANGED = "aequitas-files-changed";

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(FILES_CHANGED));
}

let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("This browser can't store files."));
        return;
      }
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("propertyId", "propertyId", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

function run(mode, action) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        let result;
        const request = action(store);
        if (request) request.onsuccess = () => (result = request.result);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error("Storage was full or blocked."));
      })
  );
}

const sameProperty = (a, b) => String(a) === String(b);

/* Metadata without the blob, newest first. */
function strip(record) {
  const { blob, ...meta } = record; // eslint-disable-line no-unused-vars
  return meta;
}

export function listFiles(propertyId) {
  return run("readonly", (store) => store.getAll()).then((records = []) =>
    records
      .filter((r) => propertyId === undefined || sameProperty(r.propertyId, propertyId))
      .map(strip)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  );
}

export function getFile(id) {
  return run("readonly", (store) => store.get(id));
}

export function getAllFileRecords() {
  return run("readonly", (store) => store.getAll()).then((records) => records || []);
}

export function putFileRecord(record) {
  return run("readwrite", (store) => store.put(record)).then((result) => {
    notify();
    return result;
  });
}

export function updateFileMeta(id, patch) {
  return getFile(id).then((record) => {
    if (!record) return null;
    const { blob, ...rest } = record;
    return putFileRecord({ ...rest, ...patch, blob, id });
  });
}

export function removeFile(id) {
  return run("readwrite", (store) => store.delete(id)).then(notify);
}

export function removeFilesForProperty(propertyId) {
  return getAllFileRecords().then((records) =>
    Promise.all(records.filter((r) => sameProperty(r.propertyId, propertyId)).map((r) => removeFile(r.id)))
  );
}

/*
 * Photos are scaled to at most 2400 px on the long side and saved as JPEG,
 * which keeps receipts readable at a few hundred KB instead of several MB.
 * PDFs and anything the browser can't decode are kept exactly as given.
 */
async function shrinkImage(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= 2400 && file.size <= 1.5 * 1024 * 1024) {
      bitmap.close?.();
      return file;
    }
    const scale = Math.min(1, 2400 / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function addFile(file, meta) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is larger than 25 MB. Save a smaller copy (for example a compressed PDF) and try again.`);
  }
  const stored = await shrinkImage(file);
  const record = {
    id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: stored.name || file.name || "Document",
    type: stored.type || "application/octet-stream",
    size: stored.size,
    blob: stored,
    createdAt: new Date().toISOString(),
    ...meta,
  };
  await putFileRecord(record);
  // Ask the browser not to clear stored data when space is low.
  navigator.storage?.persist?.().catch(() => {});
  return strip(record);
}

export function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

/* Opens a stored file: images and PDFs in a new tab, anything else downloads. */
export async function openFile(id) {
  const record = await getFile(id);
  if (!record) throw new Error("This file is no longer on this device.");
  const url = URL.createObjectURL(record.blob);
  const viewable = record.type === "application/pdf" || record.type.startsWith("image/");
  const link = document.createElement("a");
  link.href = url;
  if (viewable) {
    link.target = "_blank";
    link.rel = "noopener";
  } else {
    link.download = record.name;
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function shareFile(id) {
  const record = await getFile(id);
  if (!record) throw new Error("This file is no longer on this device.");
  const file = new File([record.blob], record.name, { type: record.type });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: record.name });
    return true;
  }
  const url = URL.createObjectURL(record.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = record.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return false;
}
