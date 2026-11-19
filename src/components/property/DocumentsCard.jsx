import { useRef, useState } from "react";

import useFiles from "../../hooks/useFiles";
import { updateProperty } from "../../services/storage";
import {
  addFile,
  formatBytes,
  openFile,
  removeFile,
  shareFile,
  updateFileMeta,
} from "../../services/fileStore";
import {
  DOCUMENT_GROUPS,
  DOCUMENT_TYPES,
  daysUntil,
  documentType,
  formatDate,
  getDocuments,
} from "../../utils/documents";

/*
 * Documents — the files themselves (kept on this device) plus, for each
 * type, whether you hold the original, where it is, and key dates.
 *
 * Replaces the earlier register: existing "have it / where kept / dates"
 * entries are shown and edited here unchanged.
 */

const smallButton = {
  padding: "8px 12px",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

const linkButton = {
  background: "none",
  border: "none",
  padding: 0,
  color: "var(--color-link)",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

function fileIcon(type) {
  if (type === "application/pdf") return "📄";
  if (type.startsWith("image/")) return "🖼️";
  return "📎";
}

function fileKind(type) {
  if (type === "application/pdf") return "PDF";
  if (type.startsWith("image/")) return "Photo";
  return "File";
}

function YearSelect({ value, onChange }) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => thisYear + 1 - i);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Year">
      <option value="">No year</option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}

function TypeSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Document type">
      {DOCUMENT_GROUPS.map((group) => (
        <optgroup key={group.id} label={group.label}>
          {DOCUMENT_TYPES.filter((t) => t.group === group.id).map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function FileRow({ file }) {
  const [editing, setEditing] = useState(false);
  const [docType, setDocType] = useState(file.docType);
  const [year, setYear] = useState(file.year ? String(file.year) : "");
  const [note, setNote] = useState(file.note || "");
  const [error, setError] = useState("");

  async function act(action) {
    setError("");
    try {
      await action();
    } catch (e) {
      if (e?.name !== "AbortError") setError(e?.message || "That didn't work.");
    }
  }

  function remove() {
    if (!window.confirm(`Remove "${file.name}" from Aequitas on this device? This can't be undone.`)) return;
    act(() => removeFile(file.id));
  }

  function save() {
    act(async () => {
      await updateFileMeta(file.id, { docType, year: year ? Number(year) : null, note: note.trim() });
      setEditing(false);
    });
  }

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1.2 }}>
          {fileIcon(file.type)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => act(() => openFile(file.id))}
            style={{ ...linkButton, fontSize: 14, textAlign: "left", wordBreak: "break-word" }}
          >
            {file.name}
          </button>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
            {fileKind(file.type)} · {formatBytes(file.size)}
            {file.year ? ` · ${file.year}` : ""} · added {formatDate(file.createdAt.slice(0, 10))}
          </div>
          {file.note && <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>{file.note}</div>}
        </div>
      </div>

      {editing ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 8 }}>
            <TypeSelect value={docType} onChange={setDocType} />
            <YearSelect value={year} onChange={setYear} />
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="primary-button" style={{ ...smallButton, width: "auto" }} onClick={save}>
              Save
            </button>
            <button type="button" className="btn-secondary" style={smallButton} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button type="button" style={linkButton} onClick={() => act(() => openFile(file.id))}>
            Open
          </button>
          <button type="button" style={linkButton} onClick={() => act(() => shareFile(file.id))}>
            Share or save
          </button>
          <button type="button" style={linkButton} onClick={() => setEditing(true)}>
            Edit details
          </button>
          <button type="button" style={{ ...linkButton, color: "var(--color-danger)" }} onClick={remove}>
            Remove
          </button>
        </div>
      )}
      {error && <span style={{ fontSize: 12, color: "var(--color-danger)" }}>{error}</span>}
    </div>
  );
}

function UploadPanel({ pending, setPending, onDone, propertyId }) {
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const type = documentType(pending.docType);

  async function save() {
    setError("");
    const failures = [];
    for (let i = 0; i < pending.files.length; i += 1) {
      setSaving(`Saving ${i + 1} of ${pending.files.length}…`);
      try {
        await addFile(pending.files[i], {
          propertyId,
          docType: pending.docType,
          year: type.yearly && pending.year ? Number(pending.year) : null,
          note: pending.note.trim(),
        });
      } catch (e) {
        failures.push(e?.message || `${pending.files[i].name} couldn't be saved.`);
      }
    }
    setSaving("");
    if (failures.length) setError(failures.join(" "));
    else onDone();
  }

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 12,
        border: "1px solid var(--color-primary)",
        background: "var(--color-primary-soft)",
        display: "grid",
        gap: 10,
      }}
    >
      <strong>
        Add {pending.files.length} file{pending.files.length === 1 ? "" : "s"}
      </strong>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        {pending.files.map((f) => `${f.name} (${formatBytes(f.size)})`).join(", ")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>What is it?</span>
          <TypeSelect value={pending.docType} onChange={(docType) => setPending({ ...pending, docType })} />
        </label>
        {type.yearly && (
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>For year</span>
            <YearSelect value={pending.year} onChange={(year) => setPending({ ...pending, year })} />
          </label>
        )}
      </div>
      <input
        value={pending.note}
        onChange={(e) => setPending({ ...pending, note: e.target.value })}
        placeholder="Note (optional), e.g. 2nd half, paid online"
      />
      {error && <span style={{ fontSize: 13, color: "var(--color-danger)" }}>{error}</span>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          className="primary-button"
          style={{ ...smallButton, width: "auto" }}
          onClick={save}
          disabled={Boolean(saving)}
        >
          {saving || "Save to Aequitas"}
        </button>
        <button type="button" className="btn-secondary" style={smallButton} onClick={() => setPending(null)} disabled={Boolean(saving)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function TypeRow({ type, files, doc, onUpdate, onAdd }) {
  const [open, setOpen] = useState(false);
  const endKey = type.id === "insurance" ? "expiryDate" : null;
  const days = endKey ? daysUntil(doc[endKey]) : null;

  const status = files.length
    ? `${files.length} file${files.length === 1 ? "" : "s"}`
    : doc.have
    ? doc.location
      ? `Original: ${doc.location}`
      : "Original noted"
    : "Not added";

  return (
    <div
      style={{
        borderRadius: 10,
        background: "var(--color-surface-sunken)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          style={{
            flex: 1,
            minWidth: 0,
            background: "none",
            border: "none",
            padding: 0,
            textAlign: "left",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            <span aria-hidden="true" style={{ display: "inline-block", width: 16, color: "var(--color-text-muted)" }}>
              {open ? "▾" : "▸"}
            </span>
            {type.label}
          </div>
          <div
            style={{
              fontSize: 12,
              marginTop: 2,
              marginLeft: 16,
              color: files.length || doc.have ? "var(--color-text-secondary)" : "var(--color-text-muted)",
            }}
          >
            {status}
            {days !== null && (
              <span
                style={{
                  marginLeft: 8,
                  fontWeight: 600,
                  color: days < 0 ? "var(--color-danger)" : days <= 30 ? "var(--color-warning)" : "var(--color-text-muted)",
                }}
              >
                {days < 0 ? `Expired ${-days} days ago` : `Expires in ${days} days`}
              </span>
            )}
          </div>
        </button>
        <button type="button" className="btn-secondary" style={smallButton} onClick={() => onAdd(type.id)}>
          + Add
        </button>
      </div>

      {open && (
        <div style={{ padding: "0 12px 12px", display: "grid", gap: 10 }}>
          {files.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
          <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", fontSize: 14 }}>
            <input
              type="checkbox"
              checked={Boolean(doc.have)}
              onChange={(e) => onUpdate({ have: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            I have the original
          </label>
          <input
            placeholder="Where is the original? e.g. safe at home, with the lawyer"
            value={doc.location || ""}
            onChange={(e) => onUpdate({ location: e.target.value })}
            aria-label={`${type.label}: where the original is kept`}
          />
          {(type.dates || []).map(([key, label]) => (
            <label key={key} style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</span>
              <input type="date" value={doc[key] || ""} onChange={(e) => onUpdate({ [key]: e.target.value })} />
            </label>
          ))}
          {type.id === "tenancy" && (
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Tenancy dates and deposits are recorded under Tenant.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DocumentsCard({ property, onSaved }) {
  const [docs, setDocs] = useState(() => getDocuments(property));
  const [pending, setPending] = useState(null);
  const [notice, setNotice] = useState("");
  const pickerType = useRef("other");
  const input = useRef(null);
  const { files, ready, error } = useFiles(property.id);

  function update(typeId, patch) {
    const next = { ...docs, [typeId]: { ...(docs[typeId] || {}), ...patch } };
    setDocs(next);
    updateProperty(property.id, { documents: next });
    onSaved?.();
  }

  function pick(typeId = "other") {
    pickerType.current = typeId;
    setNotice("");
    input.current?.click();
  }

  function chosen(event) {
    const list = Array.from(event.target.files || []);
    event.target.value = "";
    if (!list.length) return;
    setPending({
      files: list,
      docType: pickerType.current,
      year: documentType(pickerType.current).yearly ? String(new Date().getFullYear()) : "",
      note: "",
    });
  }

  const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const byType = (id) => files.filter((f) => f.docType === id);

  return (
    <div id="documents" className="card" style={{ marginTop: 24, scrollMarginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div className="card-label">DOCUMENTS</div>
          <h3 style={{ margin: "6px 0 0" }}>📁 Documents</h3>
        </div>
        <button type="button" className="primary-button" style={{ ...smallButton, width: "auto" }} onClick={() => pick("other")}>
          Add files
        </button>
      </div>
      <p className="page-subtitle" style={{ margin: "8px 0 0" }}>
        Keep the SPA, loan papers, tenancy agreement and receipts here as PDFs or photos.{" "}
        {ready && !error && (
          <>
            {files.length} file{files.length === 1 ? "" : "s"} ({formatBytes(totalBytes)}) saved on this device.
          </>
        )}{" "}
        Files stay on this device; Download backup in Settings includes them.
      </p>
      {error && (
        <p style={{ fontSize: 13, color: "var(--color-danger)", margin: "8px 0 0" }}>
          Files can&apos;t be stored in this browser ({error}). In private browsing, open Aequitas normally.
        </p>
      )}
      {notice && <p style={{ fontSize: 13, margin: "8px 0 0", color: "var(--color-success)" }}>{notice}</p>}

      <input
        ref={input}
        type="file"
        multiple
        accept="application/pdf,image/*"
        onChange={chosen}
        style={{ display: "none" }}
      />

      {pending && (
        <UploadPanel
          pending={pending}
          setPending={setPending}
          propertyId={property.id}
          onDone={() => {
            const count = pending.files.length;
            setPending(null);
            setNotice(`Saved ${count} file${count === 1 ? "" : "s"}.`);
          }}
        />
      )}

      <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
        {DOCUMENT_GROUPS.map((group) => (
          <div key={group.id} style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)" }}>{group.label}</div>
            {DOCUMENT_TYPES.filter((t) => t.group === group.id).map((type) => (
              <TypeRow
                key={type.id}
                type={type}
                files={byType(type.id)}
                doc={docs[type.id] || {}}
                onUpdate={(patch) => update(type.id, patch)}
                onAdd={pick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
