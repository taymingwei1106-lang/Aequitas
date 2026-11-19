/*
 * Zip files — dependency-free.
 *
 * zip(): builds an uncompressed ("stored") zip, used for .xlsx files and
 * for backups that include documents. PDFs and photos are already
 * compressed, so storing them as-is costs almost nothing.
 *
 * readZip(): reads a zip back. Handles stored entries and, where the
 * browser supports DecompressionStream, deflated ones (a zip re-saved by
 * another tool).
 */

/* ---------- zip (stored, no compression) ---------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function zip(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;

  files.forEach(({ name, content }) => {
    const nameBytes = encoder.encode(name);
    const data = typeof content === "string" ? encoder.encode(content) : content;
    const crc = crc32(data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, 0, true);
    local.setUint16(12, 0x21, true); // 1980-01-01
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);

    chunks.push(new Uint8Array(local.buffer), nameBytes, data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(10, 0, true);
    entry.setUint16(12, 0, true);
    entry.setUint16(14, 0x21, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, nameBytes.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), nameBytes);

    offset += 30 + nameBytes.length + data.length;
  });

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  return [...chunks, ...central, new Uint8Array(end.buffer)];
}

export function zipBlob(files, type = "application/zip") {
  return new Blob(zip(files), { type });
}

async function inflate(bytes) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This backup was re-compressed by another app and can't be opened in this browser.");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/* Returns a Map of entry name → Uint8Array. */
export async function readZip(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const decoder = new TextDecoder();

  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("This file is not a zip archive.");

  const count = view.getUint16(end + 10, true);
  let pointer = view.getUint32(end + 16, true);
  const entries = new Map();

  for (let n = 0; n < count; n += 1) {
    if (view.getUint32(pointer, true) !== 0x02014b50) throw new Error("The zip archive is damaged.");
    const method = view.getUint16(pointer + 10, true);
    const compressedSize = view.getUint32(pointer + 20, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength));

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const data = bytes.subarray(dataStart, dataStart + compressedSize);

    if (!name.endsWith("/")) {
      if (method === 0) entries.set(name, data);
      else if (method === 8) entries.set(name, await inflate(data));
      else throw new Error("The zip archive uses an unsupported compression method.");
    }

    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}
