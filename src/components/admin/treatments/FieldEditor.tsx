"use client";

/* eslint-disable @next/next/no-img-element -- previews of site and uploaded photos */
import { useId, useState, type ChangeEvent, type ReactNode } from "react";
import type { Field } from "@/lib/treatments/fields";
import { sameContent, type TreeValue } from "@/lib/treatments/tree";

/** Uploads one photo for this field and returns its address (TreatmentEditor supplies it). */
export type PhotoUploader = (file: File, field: Field) => Promise<string>;

type Props = {
  field: Field;
  value: TreeValue | undefined;
  /** The built-in value, for "Restore". Undefined inside a package or question. */
  original?: TreeValue;
  hasOriginal?: boolean;
  onChange: (value: TreeValue | undefined) => void;
  upload: PhotoUploader | null;
  /** A field of a package, question…: its placeholder is an example, not a default. */
  inItem?: boolean;
};

const asText = (v: TreeValue | undefined) => (typeof v === "string" ? v : "");
const asList = (v: TreeValue | undefined) => (Array.isArray(v) ? (v as TreeValue[]) : []);

/** Move entry i by `by` places in a copy of the list. */
function move<T>(list: T[], i: number, by: number): T[] {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** An empty item with every field of `fields`, for "Add package" and the like. */
function emptyItem(fields: Field[] = []): Record<string, TreeValue> {
  return Object.fromEntries(
    fields
      .filter((f) => !f.optional)
      .map((f) => [f.key, f.kind === "list" || f.kind === "items" || f.kind === "images" ? [] : ""])
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
  danger,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`te-icon${danger ? " te-icon-danger" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

const Up = () => <span aria-hidden="true">↑</span>;
const Down = () => <span aria-hidden="true">↓</span>;
const Cross = () => <span aria-hidden="true">×</span>;

function PhotoPicker({
  src,
  label,
  upload,
  field,
  onPicked,
  compact,
}: {
  src: string;
  label: string;
  upload: PhotoUploader | null;
  field: Field;
  onPicked: (url: string) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !upload) return;
    setBusy(true);
    setError("");
    try {
      onPicked(await upload(file, field));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`te-photo${compact ? " te-photo-compact" : ""}`}>
      <div className="te-photo-frame">{src ? <img src={src} alt="" loading="lazy" /> : <span>No photo</span>}</div>
      <label className={`pe-btn pe-btn-sm pe-upload${!upload || busy ? " is-disabled" : ""}`} title={upload ? "" : "Image uploads are not set up"}>
        {busy ? "Uploading…" : label}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={pick} disabled={!upload || busy} />
      </label>
      {error && <p className="te-error">{error}</p>}
    </div>
  );
}

/** The editor for one field of a section (or of a package, a question…). */
export default function FieldEditor({ field, value, original, hasOriginal, onChange, upload, inItem }: Props) {
  // Emptying a field that has a usual text ("Book Now") brings that text back,
  // as the page does; other fields may be left empty.
  const usesDefault = Boolean(field.placeholder) && !inItem;
  const id = useId();
  const changed = hasOriginal && !sameContent(value ?? null, original ?? null);
  const restore = changed ? (
    <button type="button" className="te-restore" onClick={() => onChange(original)} title="Put the built-in content back">
      ↺ Original
    </button>
  ) : null;

  const head = (
    <div className="te-field-head">
      <label className="pe-label" htmlFor={id}>
        {field.label}
        {changed && <span className="te-changed" title="Changed" />}
      </label>
      {restore}
    </div>
  );
  const hint = field.hint ? <p className="pe-hint">{field.hint}</p> : null;

  switch (field.kind) {
    case "text":
    case "link":
      return (
        <div className={`te-field te-field-${field.kind}`}>
          {head}
          <input
            id={id}
            className="pe-input"
            value={asText(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value === "" && usesDefault ? undefined : e.target.value)}
            spellCheck={field.kind === "text"}
          />
          {usesDefault && value === undefined ? (
            <p className="pe-hint">Empty: “{field.placeholder}” is shown.{field.hint ? ` ${field.hint}` : ""}</p>
          ) : (
            hint
          )}
        </div>
      );

    case "textarea": {
      const text = asText(value);
      return (
        <div className={`te-field te-field-${field.kind}`}>
          {head}
          <textarea
            id={id}
            className="pe-input"
            rows={Math.min(10, Math.max(3, Math.ceil(text.length / 85)))}
            value={text}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          {hint}
        </div>
      );
    }

    case "image":
      return (
        <div className={`te-field te-field-${field.kind}`}>
          {head}
          <PhotoPicker src={asText(value)} label="Upload new photo" upload={upload} field={field} onPicked={onChange} />
          {hint}
        </div>
      );

    case "list": {
      const list = asList(value).map(asText);
      const set = (next: string[]) => onChange(next);
      return (
        <div className={`te-field te-field-${field.kind}`}>
          {head}
          <div className="te-list">
            {list.map((line, i) => (
              <div className="te-list-row" key={i}>
                <span className="te-bullet" aria-hidden="true" />
                <input
                  className="pe-input"
                  id={i === 0 ? id : undefined}
                  value={line}
                  aria-label={`${field.label} ${i + 1}`}
                  onChange={(e) => set(list.map((l, j) => (j === i ? e.target.value : l)))}
                />
                <IconButton label="Move up" onClick={() => set(move(list, i, -1))} disabled={i === 0}>
                  <Up />
                </IconButton>
                <IconButton label="Move down" onClick={() => set(move(list, i, 1))} disabled={i === list.length - 1}>
                  <Down />
                </IconButton>
                <IconButton label="Remove" danger onClick={() => set(list.filter((_, j) => j !== i))}>
                  <Cross />
                </IconButton>
              </div>
            ))}
            <button type="button" className="te-add" onClick={() => set([...list, ""])}>
              + Add line
            </button>
          </div>
          {hint}
        </div>
      );
    }

    case "images": {
      const list = asList(value).map(asText);
      const set = (next: string[]) => onChange(next);
      return (
        <div className={`te-field te-field-${field.kind}`}>
          {head}
          <div className="te-photos">
            {list.map((src, i) => (
              <div className="te-photos-item" key={i}>
                <PhotoPicker
                  compact
                  src={src}
                  label="Replace"
                  upload={upload}
                  field={field}
                  onPicked={(url) => set(list.map((l, j) => (j === i ? url : l)))}
                />
                <div className="te-photos-tools">
                  <span className="te-num">{i + 1}</span>
                  <IconButton label="Move left" onClick={() => set(move(list, i, -1))} disabled={i === 0}>
                    <span aria-hidden="true">←</span>
                  </IconButton>
                  <IconButton label="Move right" onClick={() => set(move(list, i, 1))} disabled={i === list.length - 1}>
                    <span aria-hidden="true">→</span>
                  </IconButton>
                  <IconButton label="Remove photo" danger onClick={() => set(list.filter((_, j) => j !== i))}>
                    <Cross />
                  </IconButton>
                </div>
              </div>
            ))}
            <div className="te-photos-item te-photos-add">
              <PhotoPicker compact src="" label="+ Add photo" upload={upload} field={field} onPicked={(url) => set([...list, url])} />
            </div>
          </div>
          {hint}
        </div>
      );
    }

    case "items": {
      const items = asList(value) as Record<string, TreeValue>[];
      const set = (next: Record<string, TreeValue>[]) => onChange(next);
      const name = field.itemLabel ?? "Item";
      return (
        <div className={`te-field te-field-${field.kind}`}>
          {head}
          {hint}
          <div className="te-items">
            {items.map((item, i) => (
              <div className="te-item" key={i}>
                <div className="te-item-head">
                  <span className="te-item-title">
                    {name} {i + 1}
                    {typeof item.name === "string" && item.name ? ` · ${item.name}` : ""}
                    {typeof item.duration === "string" && item.duration ? ` · ${item.duration}` : ""}
                  </span>
                  {!field.fixedCount && (
                    <span className="te-item-tools">
                      <IconButton label="Move up" onClick={() => set(move(items, i, -1))} disabled={i === 0}>
                        <Up />
                      </IconButton>
                      <IconButton label="Move down" onClick={() => set(move(items, i, 1))} disabled={i === items.length - 1}>
                        <Down />
                      </IconButton>
                      <IconButton
                        label={`Remove ${name.toLowerCase()}`}
                        danger
                        onClick={() => {
                          if (window.confirm(`Remove ${name.toLowerCase()} ${i + 1}?`)) set(items.filter((_, j) => j !== i));
                        }}
                      >
                        <Cross />
                      </IconButton>
                    </span>
                  )}
                </div>
                <div className="te-item-body">
                  {(field.fields ?? []).map((sub) => (
                    <FieldEditor
                      key={sub.key}
                      field={sub}
                      value={item[sub.key]}
                      upload={upload}
                      inItem
                      onChange={(v) =>
                        set(
                          items.map((it, j) => {
                            if (j !== i) return it;
                            const next = { ...it };
                            if (v === undefined) delete next[sub.key];
                            else next[sub.key] = v;
                            return next;
                          })
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
            {!field.fixedCount && (
              <button type="button" className="te-add" onClick={() => set([...items, emptyItem(field.fields)])}>
                + Add {name.toLowerCase()}
              </button>
            )}
          </div>
        </div>
      );
    }
  }
}
