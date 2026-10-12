"use client";

import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, type ChangeEvent, type ReactNode } from "react";
import { uploadImage } from "./upload";

/** A toolbar button. mousedown is cancelled so the editor keeps its selection. */
function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`rte-btn${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

/** The article body editor (live components/admin/RichTextEditor.js, on Tiptap 3). */
export default function RichTextEditor({
  initialContent = "",
  onChange,
  canUpload = true,
}: {
  initialContent?: string;
  onChange?: (html: string) => void;
  /** False while image storage is not configured. */
  canUpload?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    // Tiptap 3 no longer re-renders on every keystroke by default; the
    // toolbar's active states need it.
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4, 5] },
        link: { openOnClick: false, autolink: true },
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      // Tables (owner, 12 Oct 2026). Not resizable: the article column sets
      // the width, so the saved HTML carries no pixel widths.
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: "Write your article here…" }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: { attributes: { class: "rte-content", "aria-label": "Article content" } },
  });

  if (!editor) return <div className="rte rte-loading">Loading editor…</div>;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL:", previous || "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleImagePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch (err) {
      alert("Failed to upload image: " + (err instanceof Error ? err.message : err));
    }
  };

  const chain = () => editor.chain().focus();
  const inTable = editor.isActive("table");

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <Btn title="Bold" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}>
          <b>B</b>
        </Btn>
        <Btn title="Italic" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}>
          <i>I</i>
        </Btn>
        <Btn title="Underline" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}>
          <u>U</u>
        </Btn>
        <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => chain().toggleStrike().run()}>
          <s>S</s>
        </Btn>
        <span className="rte-sep" />
        <Btn title="Paragraph" active={editor.isActive("paragraph")} onClick={() => chain().setParagraph().run()}>
          P
        </Btn>
        <Btn
          title="Heading H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Btn>
        <Btn
          title="Heading H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Btn>
        <Btn
          title="Heading H4"
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => chain().toggleHeading({ level: 4 }).run()}
        >
          H4
        </Btn>
        <Btn
          title="Heading H5"
          active={editor.isActive("heading", { level: 5 })}
          onClick={() => chain().toggleHeading({ level: 5 }).run()}
        >
          H5
        </Btn>
        <span className="rte-sep" />
        <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>
          • List
        </Btn>
        <Btn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => chain().toggleOrderedList().run()}
        >
          1. List
        </Btn>
        <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}>
          ❝
        </Btn>
        <span className="rte-sep" />
        <Btn
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => chain().setTextAlign("left").run()}
        >
          ⬅
        </Btn>
        <Btn
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => chain().setTextAlign("center").run()}
        >
          ↔
        </Btn>
        <Btn
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => chain().setTextAlign("right").run()}
        >
          ➡
        </Btn>
        <span className="rte-sep" />
        <Btn title="Insert or edit link" active={editor.isActive("link")} onClick={setLink}>
          🔗
        </Btn>
        <Btn title="Insert image" disabled={!canUpload} onClick={() => fileInputRef.current?.click()}>
          🖼 Image
        </Btn>
        <Btn
          title="Insert table (3 × 3, first row as headings)"
          active={inTable}
          disabled={inTable}
          onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          ▦ Table
        </Btn>
        <span className="rte-sep" />
        <Btn title="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>
          ↺
        </Btn>
        <Btn title="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>
          ↻
        </Btn>
      </div>

      {inTable && (
        <div className="rte-toolbar rte-table-bar" role="toolbar" aria-label="Table">
          <span className="rte-bar-label">Table</span>
          <Btn title="Add row above" onClick={() => chain().addRowBefore().run()}>
            + Row above
          </Btn>
          <Btn title="Add row below" onClick={() => chain().addRowAfter().run()}>
            + Row below
          </Btn>
          <Btn title="Delete row" onClick={() => chain().deleteRow().run()}>
            − Row
          </Btn>
          <span className="rte-sep" />
          <Btn title="Add column left" onClick={() => chain().addColumnBefore().run()}>
            + Col left
          </Btn>
          <Btn title="Add column right" onClick={() => chain().addColumnAfter().run()}>
            + Col right
          </Btn>
          <Btn title="Delete column" onClick={() => chain().deleteColumn().run()}>
            − Col
          </Btn>
          <span className="rte-sep" />
          <Btn title="First row as headings (on / off)" onClick={() => chain().toggleHeaderRow().run()}>
            Heading row
          </Btn>
          <Btn
            title="Merge the selected cells"
            disabled={!editor.can().mergeCells()}
            onClick={() => chain().mergeCells().run()}
          >
            Merge
          </Btn>
          <Btn title="Split a merged cell" disabled={!editor.can().splitCell()} onClick={() => chain().splitCell().run()}>
            Split
          </Btn>
          <span className="rte-sep" />
          <Btn title="Delete the whole table" onClick={() => chain().deleteTable().run()}>
            🗑 Delete table
          </Btn>
        </div>
      )}

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        hidden
        onChange={handleImagePick}
      />
    </div>
  );
}
