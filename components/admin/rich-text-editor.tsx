"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Bold,
  Code2,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  RemoveFormatting,
  Underline,
  Upload,
  X,
} from "lucide-react";
import { blogApiService } from "@/src/lib/api/services/blog-service";
import {
  AVAILABLE_BLOG_IMAGES,
  sanitizeBlogHtml,
} from "@/src/lib/store/blog";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  sessionKey: string | number;
  uploadUrl?: string;
  minHeightClass?: string;
  ariaLabel?: string;
};

type ActivePanel = "none" | "image" | "link";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function RichTextEditor({
  value,
  onChange,
  sessionKey,
  uploadUrl,
  minHeightClass = "min-h-[300px] max-h-[480px]",
  ariaLabel = "Rich text content editor",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [panel, setPanel] = useState<ActivePanel>("none");

  const [imageUrl, setImageUrl] = useState<string>(
    AVAILABLE_BLOG_IMAGES[0].value,
  );
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkLabel, setLinkLabel] = useState("");

  useEffect(() => {
    if (mode !== "visual" || !editorRef.current) return;
    editorRef.current.innerHTML = sanitizeBlogHtml(value) || "<p><br /></p>";
    // Sync DOM only on new editor session or mode switch back from HTML source
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, mode]);

  function saveSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const selection = window.getSelection();
    if (!selection) return;
    if (savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  }

  function syncFromDom() {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  }

  function runCommand(command: string, commandValue?: string) {
    if (mode !== "visual" || !editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    syncFromDom();
  }

  function insertHtmlAtCursor(htmlSnippet: string) {
    if (mode === "html") {
      onChange(`${value}${value ? "\n" : ""}${htmlSnippet}`);
      return;
    }
    const el = editorRef.current;
    if (!el) return;

    restoreSelection();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && el.contains(selection.anchorNode)) {
      const ok = document.execCommand("insertHTML", false, htmlSnippet);
      if (!ok) {
        el.insertAdjacentHTML("beforeend", htmlSnippet);
      }
    } else {
      el.insertAdjacentHTML("beforeend", htmlSnippet);
    }
    savedRangeRef.current = null;
    syncFromDom();
  }

  function openSubPanel(target: ActivePanel) {
    saveSelection();
    if (target === "link") {
      const selected = savedRangeRef.current?.toString().trim() ?? "";
      if (selected) setLinkLabel(selected);
    }
    setImageError("");
    setPanel((prev) => (prev === target ? "none" : target));
  }

  async function handleDetailImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageError("");
    setUploadingImage(true);
    try {
      let uploadedUrl: string;
      if (uploadUrl) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json().catch(() => null)) as {
          success?: boolean;
          data?: { url?: string };
          error?: { message?: string };
        } | null;
        if (!response.ok || !payload?.success || !payload.data?.url) {
          throw new Error(payload?.error?.message ?? "Image upload failed");
        }
        uploadedUrl = payload.data.url;
      } else {
        uploadedUrl = await blogApiService.uploadImage(file);
      }
      setImageUrl(uploadedUrl);
      if (!imageAlt) {
        setImageAlt(
          file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim(),
        );
      }
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function handleInsertImage() {
    const cleanedUrl = imageUrl.trim();
    if (!cleanedUrl) {
      setImageError("Please provide an image URL or upload an image.");
      return;
    }

    const safeSrc = escapeHtml(cleanedUrl);
    const safeAlt = escapeHtml(imageAlt.trim() || "Majisavesh journal detail");
    const captionHtml = imageCaption.trim()
      ? `<figcaption>${escapeHtml(imageCaption.trim())}</figcaption>`
      : "";

    const figureHtml = `<figure><img src="${safeSrc}" alt="${safeAlt}" />${captionHtml}</figure><p><br /></p>`;
    insertHtmlAtCursor(figureHtml);

    setImageAlt("");
    setImageCaption("");
    setPanel("none");
  }

  function handleInsertLink() {
    const cleaned = linkUrl.trim();
    if (!cleaned) return;
    const safeHref = escapeHtml(cleaned);
    const selectedText = savedRangeRef.current?.toString().trim() ?? "";
    const text = escapeHtml(linkLabel.trim() || selectedText || cleaned);
    insertHtmlAtCursor(`<a href="${safeHref}">${text}</a>`);
    setLinkUrl("https://");
    setLinkLabel("");
    setPanel("none");
  }

  const toolbarBtnClass =
    "inline-flex h-8 min-w-8 items-center justify-center border border-transparent px-1.5 text-xs text-[#4b3c33] transition hover:border-[#dfd8cf] hover:bg-white hover:text-[#39231e]";

  return (
    <div className="border border-[#dfd8cf] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8ded2] bg-[#faf7f3] px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-0.5">
          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("formatBlock", "p")}
            title="Paragraph"
            aria-label="Paragraph"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <Pilcrow size={14} />
          </button>
          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("formatBlock", "h2")}
            title="Heading 2"
            aria-label="Heading 2"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("formatBlock", "h3")}
            title="Heading 3"
            aria-label="Heading 3"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <Heading3 size={15} />
          </button>

          <span className="mx-1 h-4 w-px bg-[#dfd8cf]" aria-hidden="true" />

          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("bold")}
            title="Bold"
            aria-label="Bold"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("italic")}
            title="Italic"
            aria-label="Italic"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("underline")}
            title="Underline"
            aria-label="Underline"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <Underline size={14} />
          </button>

          <span className="mx-1 h-4 w-px bg-[#dfd8cf]" aria-hidden="true" />

          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("insertUnorderedList")}
            title="Bullet list"
            aria-label="Bullet list"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <List size={15} />
          </button>
          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("insertOrderedList")}
            title="Numbered list"
            aria-label="Numbered list"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("formatBlock", "blockquote")}
            title="Blockquote"
            aria-label="Blockquote"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <Quote size={14} />
          </button>
          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertHtmlAtCursor("<hr /><p><br /></p>")}
            title="Divider line"
            aria-label="Divider line"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <Minus size={14} />
          </button>

          <span className="mx-1 h-4 w-px bg-[#dfd8cf]" aria-hidden="true" />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openSubPanel("link")}
            title="Insert link"
            aria-label="Insert link"
            className={`${toolbarBtnClass} ${panel === "link" ? "border-[#8d3428] bg-white text-[#8d3428]" : ""}`}
          >
            <Link2 size={14} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openSubPanel("image")}
            className={`inline-flex h-8 items-center gap-1.5 border px-2.5 text-[11px] font-medium transition ${
              panel === "image"
                ? "border-[#8d3428] bg-[#8d3428] text-white"
                : "border-[#d8ccc0] bg-white text-[#39231e] hover:border-[#8d3428]"
            }`}
          >
            <ImagePlus size={14} /> Add detail image
          </button>

          <button
            type="button"
            disabled={mode !== "visual"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("removeFormat")}
            title="Clear formatting"
            aria-label="Clear formatting"
            className={`${toolbarBtnClass} disabled:opacity-40`}
          >
            <RemoveFormatting size={14} />
          </button>
        </div>

        <div className="flex items-center border border-[#dfd8cf] bg-white p-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 transition ${
              mode === "visual"
                ? "bg-[#39231e] text-white"
                : "text-[#77675d] hover:text-[#39231e]"
            }`}
          >
            <Eye size={12} /> Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 transition ${
              mode === "html"
                ? "bg-[#39231e] text-white"
                : "text-[#77675d] hover:text-[#39231e]"
            }`}
          >
            <Code2 size={12} /> HTML
          </button>
        </div>
      </div>

      {panel === "image" && (
        <div className="border-b border-[#e8ded2] bg-[#fdfaf5] p-3.5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a44436]">
              Insert image inside blog content
            </p>
            <button
              type="button"
              onClick={() => setPanel("none")}
              aria-label="Close image panel"
              className="p-1 text-[#77675d] hover:text-[#39231e]"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {AVAILABLE_BLOG_IMAGES.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setImageUrl(preset.value)}
                className={`border px-2.5 py-1 text-[11px] transition ${
                  imageUrl === preset.value
                    ? "border-[#8d3428] bg-[#f7eee9] font-medium text-[#8d3428]"
                    : "border-[#ded3c7] bg-white text-[#5f5750] hover:border-[#39231e]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="Paste image URL (https://... or /products/...)"
              className="w-full border border-[#ded3c7] bg-white px-3 py-2 text-xs text-[#33251f] outline-none focus:border-[#8d3428]"
            />
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleDetailImageUpload}
                className="sr-only"
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-full w-full items-center justify-center gap-1.5 border border-[#39231e] bg-white px-3 py-2 text-[11px] font-medium text-[#39231e] transition hover:bg-[#39231e] hover:text-white disabled:opacity-50"
              >
                <Upload size={13} />
                {uploadingImage ? "Uploading..." : "Upload image"}
              </button>
            </div>
          </div>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <input
              type="text"
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
              placeholder="Image alt text (for SEO & accessibility)"
              className="border border-[#ded3c7] bg-white px-3 py-2 text-xs text-[#33251f] outline-none focus:border-[#8d3428]"
            />
            <input
              type="text"
              value={imageCaption}
              onChange={(event) => setImageCaption(event.target.value)}
              placeholder="Optional image caption"
              className="border border-[#ded3c7] bg-white px-3 py-2 text-xs text-[#33251f] outline-none focus:border-[#8d3428]"
            />
          </div>

          {imageError && (
            <p className="mt-2 text-xs text-[#a44436]">{imageError}</p>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            {imageUrl ? (
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="size-10 border border-[#ded3c7] bg-[#f3ece2] object-cover"
                />
                <span className="max-w-[200px] truncate text-[11px] text-[#77675d]">
                  Ready to insert
                </span>
              </div>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={handleInsertImage}
              className="bg-[#39231e] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#52342c]"
            >
              Insert into content
            </button>
          </div>
        </div>
      )}

      {panel === "link" && (
        <div className="border-b border-[#e8ded2] bg-[#fdfaf5] p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a44436]">
              Insert link
            </p>
            <button
              type="button"
              onClick={() => setPanel("none")}
              aria-label="Close link panel"
              className="p-1 text-[#77675d] hover:text-[#39231e]"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              value={linkLabel}
              onChange={(event) => setLinkLabel(event.target.value)}
              placeholder="Link text (optional if text selected)"
              className="border border-[#ded3c7] bg-white px-3 py-2 text-xs text-[#33251f] outline-none focus:border-[#8d3428]"
            />
            <input
              type="text"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="/collection or https://..."
              className="border border-[#ded3c7] bg-white px-3 py-2 text-xs text-[#33251f] outline-none focus:border-[#8d3428]"
            />
            <button
              type="button"
              onClick={handleInsertLink}
              className="bg-[#39231e] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
            >
              Apply link
            </button>
          </div>
        </div>
      )}

      {mode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncFromDom}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          aria-label={ariaLabel}
          className={`blog-rich-content overflow-y-auto px-4 py-4 outline-none ${minHeightClass}`}
        />
      ) : (
        <textarea
          rows={13}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="<h2>Heading</h2><p>Write or paste HTML...</p><figure><img src='/products/teal-poshak.png' alt='' /></figure>"
          className="w-full resize-y bg-[#fffdf9] p-4 font-mono text-xs leading-6 text-[#33251f] outline-none"
        />
      )}
    </div>
  );
}
