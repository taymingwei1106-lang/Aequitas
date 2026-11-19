/*
 * Minimal .xlsx writer — no dependencies.
 *
 * Builds a real Excel workbook (Office Open XML in an uncompressed zip),
 * so the file opens in Excel, Numbers and Google Sheets without the
 * "file format doesn't match" warning a renamed CSV/HTML file triggers.
 *
 * Usage:
 *   const blob = buildWorkbook([
 *     { name: "Summary", widths: [28, 14], rows: [
 *         [{ v: "Title", s: "title" }],
 *         [{ v: "Property", s: "header" }, { v: "Rent (RM)", s: "header" }],
 *         ["The Era", { v: 13800, s: "money" }],
 *     ] },
 *   ]);
 *
 * A cell is a string, a number, null/"" (empty), or { v, s } where s is one
 * of: bold, money, moneyBold, header, title, note.
 */

import { zip } from "./zip";

const STYLE_INDEX = {
  default: 0,
  bold: 1,
  money: 2,
  moneyBold: 3,
  header: 4,
  title: 5,
  note: 6,
  headerMoney: 7,
};

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00;[Red]-#,##0.00"/></numFmts>
<fonts count="4">
<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="14"/><name val="Calibri"/><family val="2"/></font>
<font><i/><sz val="10"/><color rgb="FF6B7280"/><name val="Calibri"/><family val="2"/></font>
</fonts>
<fills count="3">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF8"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top/><bottom style="thin"><color rgb="FF9CA3AF"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="8">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Characters not allowed in XML 1.0.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function columnName(index) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function cellXml(cell, ref) {
  if (cell === null || cell === undefined || cell === "") return "";
  const value = typeof cell === "object" ? cell.v : cell;
  const style = typeof cell === "object" && cell.s ? STYLE_INDEX[cell.s] ?? 0 : 0;
  const s = style ? ` s="${style}"` : "";

  if (value === null || value === undefined || value === "") {
    return style ? `<c r="${ref}"${s}/>` : "";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"${s}><v>${Math.round(value * 100) / 100}</v></c>`;
  }

  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function sheetXml(sheet) {
  const cols = (sheet.widths || [])
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join("");

  const rows = (sheet.rows || [])
    .map((row, r) => {
      const cells = (row || []).map((cell, c) => cellXml(cell, `${columnName(c)}${r + 1}`)).join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");

  const freeze = sheet.freezeRow
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${sheet.freezeRow}" topLeftCell="A${
        sheet.freezeRow + 1
      }" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${freeze}${
    cols ? `<cols>${cols}</cols>` : ""
  }<sheetData>${rows}</sheetData></worksheet>`;
}

/* Excel sheet names: max 31 chars, no []:*?/\ and unique. */
function safeSheetNames(sheets) {
  const used = new Set();
  return sheets.map((sheet, i) => {
    let base = String(sheet.name || `Sheet${i + 1}`)
      .replace(/[[\]:*?/\\]/g, " ")
      .trim()
      .slice(0, 31) || `Sheet${i + 1}`;
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) {
      const suffix = ` (${n})`;
      name = base.slice(0, 31 - suffix.length) + suffix;
      n += 1;
    }
    used.add(name.toLowerCase());
    return name;
  });
}

/* Returns the workbook as a list of byte arrays (for tests) */
export function buildWorkbookParts(sheets) {
  const names = safeSheetNames(sheets);

  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${names
        .map(
          (_, i) =>
            `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
        )
        .join("")}</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names
        .map((name, i) => `<sheet name="${escapeXml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
        .join("")}</sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${names
        .map(
          (_, i) =>
            `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
        )
        .join("")}<Relationship Id="rId${
        names.length + 1
      }" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    { name: "xl/styles.xml", content: STYLES_XML },
    ...sheets.map((sheet, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, content: sheetXml(sheet) })),
  ];

  return zip(files);
}

export function buildWorkbook(sheets) {
  return new Blob(buildWorkbookParts(sheets), {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
