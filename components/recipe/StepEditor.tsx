"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import styles from "./StepEditor.module.css";

export interface StepEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const preventFocus = (e: React.MouseEvent) => e.preventDefault();
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Formatering">
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? styles.btnActive : styles.btn}
        aria-pressed={editor.isActive("bold")}
        aria-label="Fetstil"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? styles.btnActive : styles.btn}
        aria-pressed={editor.isActive("italic")}
        aria-label="Kursiv"
      >
        <em>I</em>
      </button>
      <span className={styles.sep} aria-hidden />
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? styles.btnActive : styles.btn}
        aria-pressed={editor.isActive("heading", { level: 3 })}
        aria-label="Rubrik 3"
      >
        H3
      </button>
      <span className={styles.sep} aria-hidden />
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? styles.btnActive : styles.btn}
        aria-pressed={editor.isActive("bulletList")}
        aria-label="Punktlista"
      >
        •
      </button>
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? styles.btnActive : styles.btn}
        aria-pressed={editor.isActive("orderedList")}
        aria-label="Numrerad lista"
      >
        1.
      </button>
    </div>
  );
}

export function StepEditor({ value, onChange, placeholder = "Instruktion" }: StepEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: styles.editorContent,
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    if (next === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.setContent("", { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className={styles.wrap}>
      <Toolbar editor={editor} />
      <div className={styles.editorWrap}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
