import { getAllFileRecords, putFileRecord } from "./fileStore";
import { readZip, zipBlob } from "../utils/zip";

/*
 * Backup files.
 *
 * Without documents: the same .json file as before ({ storageKey: rawString }).
 * With documents: a .zip containing
 *   aequitas-backup.json      the same JSON as above
 *   documents/manifest.json   [{ id, propertyId, docType, name, type, size, createdAt, year, note, link, path }]
 *   documents/files/<id>      each file's bytes
 * Both kinds can be restored; older .json backups keep working.
 */

const DATA_ENTRY = "aequitas-backup.json";
const MANIFEST_ENTRY = "documents/manifest.json";

function stamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

export async function buildBackup(data, prefix = "aequitas-backup") {
  const json = JSON.stringify(data, null, 2);
  // A browser that can't open file storage simply has no documents to include.
  const records = await getAllFileRecords().catch(() => []);

  if (!records.length) {
    return {
      blob: new Blob([json], { type: "application/json" }),
      filename: `${prefix}-${stamp()}.json`,
      fileCount: 0,
      bytes: 0,
    };
  }

  const manifest = [];
  const entries = [{ name: DATA_ENTRY, content: json }];

  for (const record of records) {
    const { blob, ...meta } = record;
    const path = `documents/files/${record.id}`;
    manifest.push({ ...meta, path });
    entries.push({ name: path, content: new Uint8Array(await blob.arrayBuffer()) });
  }
  entries.splice(1, 0, { name: MANIFEST_ENTRY, content: JSON.stringify(manifest, null, 2) });

  return {
    blob: zipBlob(entries),
    filename: `${prefix}-${stamp()}.zip`,
    fileCount: records.length,
    bytes: records.reduce((sum, r) => sum + (r.size || 0), 0),
  };
}

/*
 * Reads a chosen backup file.
 * Returns { data, files: [{ meta, bytes }] } or throws with a plain message.
 */
export async function readBackupFile(file) {
  const isZip = /\.zip$/i.test(file.name) || file.type === "application/zip" || file.type === "application/x-zip-compressed";

  if (!isZip) {
    const text = await file.text();
    try {
      return { data: JSON.parse(text), files: [] };
    } catch {
      throw new Error("This file could not be read as an Aequitas backup.");
    }
  }

  const entries = await readZip(await file.arrayBuffer());
  const decoder = new TextDecoder();
  const dataBytes = entries.get(DATA_ENTRY);
  if (!dataBytes) throw new Error("This zip is not an Aequitas backup.");

  let data;
  try {
    data = JSON.parse(decoder.decode(dataBytes));
  } catch {
    throw new Error("The data in this backup is damaged and cannot be read.");
  }

  let manifest = [];
  const manifestBytes = entries.get(MANIFEST_ENTRY);
  if (manifestBytes) {
    try {
      manifest = JSON.parse(decoder.decode(manifestBytes));
    } catch {
      throw new Error("The document list in this backup is damaged.");
    }
  }

  const files = (Array.isArray(manifest) ? manifest : [])
    .filter((meta) => meta?.id && entries.has(meta.path))
    .map((meta) => ({ meta, bytes: entries.get(meta.path) }));

  return { data, files };
}

/* Adds (or replaces, by id) each file from a backup. Other files are kept. */
export async function restoreFiles(files) {
  for (const { meta, bytes } of files) {
    const { path, ...rest } = meta; // eslint-disable-line no-unused-vars
    await putFileRecord({ ...rest, blob: new Blob([bytes], { type: meta.type || "application/octet-stream" }) });
  }
}

export function downloadBackup({ blob, filename }) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
