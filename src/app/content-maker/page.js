"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Upload,
  FileText,
  X,
  Loader2,
  Download,
  AlertCircle,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Type,
  Save,
  Printer,
  ExternalLink,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import { apiBaseUrl, createContent } from "@/utils/api";
import { useTheme } from "@/providers/ThemeProvider";

export default function ContentMaker() {
  const { theme } = useTheme();
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("preview");
  const [pdfUrl, setPdfUrl] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [rawText, setRawText] = useState("");
  const [showImportText, setShowImportText] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [lineHeight, setLineHeight] = useState("1.6");
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("system-ui");
  const [textColor, setTextColor] = useState("#111827");
  const [highlightColor, setHighlightColor] = useState("#fef08a");
  const [savedHint, setSavedHint] = useState("");
  const [autoSavedAt, setAutoSavedAt] = useState(0);
  const editorRef = useRef(null);

  const resolveUrl = useCallback((url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`;
  }, []);

  const escapeHtml = useCallback(
    (value) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;"),
    []
  );

  const defaultEditorHtml = useMemo(() => {
    const title = topic.trim() ? escapeHtml(topic.trim()) : "Generated Content";
    return `<h1 style="margin:0 0 12px 0;">${title}</h1>
<p style="margin:0 0 10px 0;">Paste or write your final content here. Use the toolbar to style (bold, italic, headings, alignment, spacing) and download.</p>
<h2 style="margin:18px 0 10px 0;">Highlights</h2>
<ul>
  <li>Key definitions</li>
  <li>Important dates / facts</li>
  <li>Short notes</li>
</ul>
<h2 style="margin:18px 0 10px 0;">Questions</h2>
<ol>
  <li>Write 3–5 practice questions here</li>
</ol>`;
  }, [escapeHtml, topic]);

  const toNotesHtml = useCallback(
    (text) => {
      const title = topic.trim() ? escapeHtml(topic.trim()) : "Study Notes";
      const formatInline = (value) => {
        const escaped = escapeHtml(value);
        return escaped
          .replaceAll(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replaceAll(/__(.+?)__/g, "<strong>$1</strong>")
          .replaceAll(/~~(.+?)~~/g, "<s>$1</s>")
          .replaceAll(/\*(.+?)\*/g, "<em>$1</em>")
          .replaceAll(/_(.+?)_/g, "<em>$1</em>");
      };

      const rawLines = String(text || "")
        .replaceAll("\r\n", "\n")
        .replaceAll("\r", "\n")
        .split("\n")
        .map((l) => l.replaceAll("\t", "  "))
        .filter((l) => l.trim())
        .filter((l) => l.trim() !== "```" && l.trim().toLowerCase() !== "```text");

      if (rawLines.length === 0) return defaultEditorHtml;

      const blocks = [];
      let currentHeading = "";
      let listItems = [];

      const flush = () => {
        if (!currentHeading && listItems.length === 0) return;
        blocks.push({
          heading: currentHeading,
          items: listItems
        });
        currentHeading = "";
        listItems = [];
      };

      for (const rawLine of rawLines) {
        const indent = rawLine.match(/^\s*/)?.[0]?.length || 0;
        const line = rawLine.trim();

        const boldTitle = line.match(/^\*\*(.+?)\*\*$/);
        if (boldTitle && boldTitle[1] && line.length <= 90) {
          flush();
          currentHeading = formatInline(boldTitle[1].trim());
          continue;
        }

        const boldWithRest = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
        if (boldWithRest) {
          listItems.push({
            ordered: false,
            depth: 0,
            html: `<strong>${formatInline(boldWithRest[1].trim())}:</strong> ${formatInline(boldWithRest[2].trim())}`
          });
          continue;
        }

        if (/^[A-Z][A-Z\s0-9&/().,-]{4,}$/.test(line) && line.length <= 72) {
          flush();
          currentHeading = formatInline(line);
          continue;
        }

        if (/:$/.test(line) && line.length <= 72) {
          flush();
          currentHeading = formatInline(line.replace(/:$/, ""));
          continue;
        }

        const kv = line.match(/^([^:]{2,50}):\s*(.+)$/);
        if (kv) {
          const left = formatInline(kv[1].trim());
          const right = formatInline(kv[2].trim());
          listItems.push({ ordered: false, depth: 0, html: `<strong>${left}:</strong> ${right}` });
          continue;
        }

        const num = line.match(/^(\d+)[.)]\s+(.+)$/);
        if (num) {
          listItems.push({ ordered: true, depth: 0, html: formatInline(num[2].trim()) });
          continue;
        }

        const bullet = line.match(/^([•●▪■◦○]|[-–—]|[oO])\s+(.+)$/);
        if (bullet) {
          const symbol = bullet[1];
          const content = bullet[2];
          const symbolDepth = symbol === "o" || symbol === "O" || symbol === "○" || symbol === "◦" ? 1 : 0;
          const depth = Math.min(1, Math.max(symbolDepth, Math.floor(indent / 2)));
          listItems.push({ ordered: false, depth, html: formatInline(content.trim()) });
          continue;
        }

        if (/^[-–—]\s+/.test(line)) {
          listItems.push({ ordered: false, depth: 0, html: formatInline(line.replace(/^[-–—]\s+/, "")) });
          continue;
        }

        listItems.push({ ordered: false, depth: 0, html: formatInline(line) });
      }

      flush();

      const htmlParts = [
        `<h1 style="margin:0 0 14px 0;">${title}</h1>`,
        `<p style="margin:0 0 12px 0; color:${theme === "dark" ? "#cbd5e1" : "#4b5563"};">Structured notes generated from extracted text. You can edit everything below.</p>`
      ];

      for (const b of blocks) {
        if (b.heading) {
          htmlParts.push(`<h2 style="margin:18px 0 10px 0;">${b.heading}</h2>`);
        }
        const items = Array.isArray(b.items) ? b.items : [];
        if (items.length > 0) {
          const top = items.filter((i) => (i?.depth || 0) === 0);
          const orderedCount = top.filter((i) => i.ordered).length;
          const unorderedCount = top.length - orderedCount;
          const topListTag = orderedCount > 0 && orderedCount >= unorderedCount ? "ol" : "ul";

          const groups = [];
          for (const it of items) {
            const depth = it?.depth || 0;
            if (depth === 0 || groups.length === 0) {
              groups.push({ ...it, subs: [] });
            } else {
              groups[groups.length - 1].subs.push(it);
            }
          }

          htmlParts.push(`<${topListTag}>`);
          for (const g of groups) {
            htmlParts.push("<li>");
            htmlParts.push(g.html);
            if (g.subs.length > 0) {
              const subTop = g.subs.filter((s) => (s?.depth || 0) > 0);
              const subOrdered = subTop.filter((s) => s.ordered).length;
              const subTag = subOrdered > 0 ? "ol" : "ul";
              htmlParts.push(`<${subTag}>`);
              for (const s of subTop) {
                htmlParts.push(`<li>${s.html}</li>`);
              }
              htmlParts.push(`</${subTag}>`);
            }
            htmlParts.push("</li>");
          }
          htmlParts.push(`</${topListTag}>`);
        }
      }

      return htmlParts.join("\n");
    },
    [defaultEditorHtml, escapeHtml, theme, topic]
  );

  const effectiveTextColor = useMemo(() => {
    if (theme === "dark" && (textColor === "#111827" || textColor === "#000000")) return "#e5e7eb";
    return textColor;
  }, [textColor, theme]);

  const extractTextFromPdf = useCallback(async () => {
    setExtractError("");
    setIsExtracting(true);
    try {
      let data;
      if (pdfUrl) {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(`Failed to fetch PDF (${response.status})`);
        data = await response.arrayBuffer();
      } else if (files[0] && typeof files[0].arrayBuffer === "function") {
        data = await files[0].arrayBuffer();
      } else {
        throw new Error("No PDF available to extract text.");
      }

      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      const ver = pdfjsLib?.version || "4.10.38";
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${ver}/pdf.worker.min.mjs`;
      }

      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => (item && typeof item.str === "string" ? item.str : ""))
          .join(" ")
          .replaceAll(/\s+/g, " ")
          .trim();
        if (pageText) fullText += `${pageText}\n\n`;
      }

      const extracted = fullText.trim();
      if (!extracted) throw new Error("No selectable text found in PDF (maybe scanned images).");

      setRawText(extracted);
      setEditorHtml(toNotesHtml(extracted));
      setActiveView("editor");
      setShowImportText(false);
      window.setTimeout(() => editorRef.current?.focus(), 0);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Failed to extract text from PDF.");
      setShowImportText(true);
    } finally {
      setIsExtracting(false);
    }
  }, [files, pdfUrl, toNotesHtml]);

  const buildPrintDocument = useCallback(
    (contentHtml) => {
      const safeFontSize = Number.isFinite(Number(fontSize)) ? Number(fontSize) : 16;
      const safeLineHeight = lineHeight || "1.6";
      const titleText = topic.trim() ? escapeHtml(topic.trim()) : "Study Notes";

      return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${titleText}</title>
    <style>
      @page { margin: 18mm 16mm; }
      html, body { padding: 0; margin: 0; background: #f3f4f6; }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        font-family: ${fontFamily}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        font-size: ${safeFontSize}px;
        line-height: ${safeLineHeight};
        color: #111827;
      }
      .page {
        max-width: 820px;
        margin: 24px auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        box-shadow: 0 18px 40px rgba(17, 24, 39, 0.10);
        border-radius: 16px;
        padding: 26px 28px;
      }
      .meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin: 0 0 16px 0;
        padding: 0 0 12px 0;
        border-bottom: 1px solid #eef2f7;
      }
      .meta .title {
        font-size: ${Math.max(20, safeFontSize + 10)}px;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin: 0;
      }
      .meta .subtitle {
        font-size: ${Math.max(12, safeFontSize - 2)}px;
        color: #6b7280;
        margin: 4px 0 0 0;
        font-weight: 600;
      }
      h1 { font-size: ${Math.max(20, safeFontSize + 8)}px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.01em; }
      h2 { font-size: ${Math.max(16, safeFontSize + 2)}px; font-weight: 800; margin: 16px 0 8px 0; }
      h3 { font-size: ${Math.max(14, safeFontSize)}px; font-weight: 700; margin: 12px 0 8px 0; }
      p { margin: 0 0 10px 0; }
      ul, ol { margin: 0 0 10px 22px; padding: 0; }
      li { margin: 4px 0; }
      ul { list-style-type: disc; }
      ul ul { list-style-type: circle; margin-top: 6px; }
      ul ul ul { list-style-type: square; }
      ol { list-style-type: decimal; }
      strong { font-weight: 800; }
      s { opacity: 0.85; }
      a { color: inherit; text-decoration: none; }
      @media print {
        html, body { background: #ffffff; }
        .page { margin: 0; border: 0; box-shadow: none; border-radius: 0; padding: 0; }
        .meta { border-bottom-color: #e5e7eb; padding-bottom: 10px; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="meta">
        <div>
          <div class="title">${titleText}</div>
          <div class="subtitle">Clean notes template</div>
        </div>
      </div>
      ${contentHtml}
    </div>
  </body>
</html>`;
    },
    [escapeHtml, fontFamily, fontSize, lineHeight, topic]
  );

  const applyCommand = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(command, false, value);
    setEditorHtml(editorRef.current.innerHTML);
  };

  const saveEditor = () => {
    if (!pdfUrl) return;
    const payload = {
      html: editorRef.current ? editorRef.current.innerHTML : editorHtml,
      lineHeight,
      fontSize,
      fontFamily,
      textColor,
      highlightColor,
      savedAt: Date.now()
    };
    localStorage.setItem(`contentMakerEditor:${pdfUrl}`, JSON.stringify(payload));
    setSavedHint("Saved");
    window.setTimeout(() => setSavedHint(""), 1500);
  };

  const autoSaveEditor = useCallback(() => {
    if (!pdfUrl) return;
    const payload = {
      html: editorRef.current ? editorRef.current.innerHTML : editorHtml,
      lineHeight,
      fontSize,
      fontFamily,
      textColor,
      highlightColor,
      savedAt: Date.now()
    };
    localStorage.setItem(`contentMakerEditor:${pdfUrl}`, JSON.stringify(payload));
    setAutoSavedAt(payload.savedAt);
  }, [editorHtml, fontFamily, fontSize, highlightColor, lineHeight, pdfUrl, textColor]);

  const resetEditor = () => {
    setEditorHtml(defaultEditorHtml);
  };

  const downloadAsHtml = () => {
    const html = editorRef.current ? editorRef.current.innerHTML : editorHtml;
    const full = `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Content Maker</title></head><body>${html}</body></html>`;
    const blob = new Blob([full], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content-maker.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadAsWord = () => {
    const html = editorRef.current ? editorRef.current.innerHTML : editorHtml;
    const full = `<!doctype html><html><head><meta charset="utf-8" /><title>Content Maker</title></head><body>${html}</body></html>`;
    const blob = new Blob([full], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content-maker.doc";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadEditedPdf = () => {
    const html = editorRef.current ? editorRef.current.innerHTML : editorHtml;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(buildPrintDocument(html));
    w.document.close();
    w.focus();
    w.print();
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Filter for PDFs only
      const pdfFiles = newFiles.filter(file => file.type === "application/pdf");
      
      if (pdfFiles.length !== newFiles.length) {
        setError("Only PDF files are allowed.");
      } else {
        setError(null);
      }
      
      setFiles((prev) => [...prev, ...pdfFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setPdfUrl("");
    setActiveView("preview");
    setRawText("");
    setShowImportText(false);
    setExtractError("");

    try {
      const data = await createContent(files, topic);
      setResult(data);
    } catch (err) {
      setError("Failed to generate content. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!result?.pdf_url) return;
    const nextPdfUrl = resolveUrl(result.pdf_url);
    setPdfUrl(nextPdfUrl);
    setActiveView("preview");

    const maybeText =
      (typeof result?.raw_text === "string" && result.raw_text) ||
      (typeof result?.text === "string" && result.text) ||
      (typeof result?.content_text === "string" && result.content_text);
    const notes = typeof result?.notes_html === "string" ? result.notes_html.trim() : "";
    if (notes) {
      if (notes.includes("<")) {
        setEditorHtml(notes);
      } else {
        setRawText(notes);
        setEditorHtml(toNotesHtml(notes));
      }
      setActiveView("editor");
      return;
    }
    if (maybeText) {
      setRawText(maybeText);
      setEditorHtml(toNotesHtml(maybeText));
      setActiveView("editor");
    }
  }, [resolveUrl, result, toNotesHtml]);

  useEffect(() => {
    if (!pdfUrl) return;
    const raw = localStorage.getItem(`contentMakerEditor:${pdfUrl}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.html === "string") setEditorHtml(parsed.html);
        if (typeof parsed?.lineHeight === "string") setLineHeight(parsed.lineHeight);
        if (typeof parsed?.fontSize === "string") setFontSize(parsed.fontSize);
        if (typeof parsed?.fontFamily === "string") setFontFamily(parsed.fontFamily);
        if (typeof parsed?.textColor === "string") setTextColor(parsed.textColor);
        if (typeof parsed?.highlightColor === "string") setHighlightColor(parsed.highlightColor);
        return;
      } catch {}
    }
    setEditorHtml(defaultEditorHtml);
    setLineHeight("1.6");
    setFontSize("16");
    setFontFamily("system-ui");
    setTextColor(theme === "dark" ? "#e5e7eb" : "#111827");
    setHighlightColor("#fef08a");
  }, [defaultEditorHtml, pdfUrl, theme]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (!editorHtml) return;
    if (editorRef.current.innerHTML !== editorHtml) {
      editorRef.current.innerHTML = editorHtml;
    }
  }, [editorHtml]);

  useEffect(() => {
    if (!pdfUrl) return;
    if (!editorHtml) return;
    const t = window.setTimeout(() => {
      autoSaveEditor();
    }, 900);
    return () => window.clearTimeout(t);
  }, [autoSaveEditor, editorHtml, pdfUrl]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            Content Maker <span className="ml-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 p-2 rounded-lg"><FileText className="w-6 h-6" /></span>
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Topic Input */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic (Optional)
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Revolt of 1857 Modern History"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20 focus:border-brand-500 dark:focus:border-brand-400 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload PDF Files
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 md:p-8 text-center hover:border-brand-500 dark:hover:border-brand-400 transition-colors bg-gray-50/50 dark:bg-gray-700/50 group cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center space-y-3 pointer-events-none">
                  <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF files only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selected Files</p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-brand-50/50 dark:bg-brand-900/20 rounded-lg border border-brand-100 dark:border-brand-800">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText className="w-5 h-5 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-800">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || files.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center space-x-2
                ${isLoading || files.length === 0
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-brand-600 to-brand-700 hover:shadow-xl hover:scale-[1.01]"
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result Area */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">Generated Output</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preview the PDF and edit content before final download.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView("preview")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                    activeView === "preview"
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  PDF Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("editor")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                    activeView === "editor"
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  Live Editor
                </button>

                {pdfUrl && (
                  <>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Original PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView("editor");
                        window.setTimeout(() => downloadEditedPdf(), 0);
                      }}
                      disabled={!editorHtml.trim()}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                        editorHtml.trim()
                          ? "bg-brand-600 hover:bg-brand-700 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                      Clean PDF
                    </button>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </a>
                  </>
                )}
              </div>
            </div>

            {activeView === "preview" ? (
              <div className="p-5 md:p-6">
                {pdfUrl ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                      <iframe
                        key={pdfUrl}
                        src={pdfUrl}
                        title="PDF Preview"
                        className="w-full h-[60vh]"
                      />
                    </div>

                    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        This is the original PDF. For a clean professional PDF template, extract/clean notes and download the Clean PDF.
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={extractTextFromPdf}
                          disabled={isExtracting}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                            isExtracting
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-brand-600 hover:bg-brand-700 text-white"
                          }`}
                        >
                          {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                          Extract Text
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const plain = editorRef.current ? editorRef.current.innerText : rawText;
                            setRawText(plain || "");
                            setEditorHtml(toNotesHtml(plain || ""));
                            setActiveView("editor");
                            setShowImportText(false);
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 transition-colors flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Clean Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveView("editor");
                            window.setTimeout(() => downloadEditedPdf(), 0);
                          }}
                          disabled={!editorHtml.trim()}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                            editorHtml.trim()
                              ? "bg-brand-600 hover:bg-brand-700 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Printer className="w-4 h-4" />
                          Download Clean PDF
                        </button>
                      </div>
                    </div>

                    {editorHtml.trim() && (
                      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Clean Notes (Template Preview)
                        </div>
                        <div className="p-4 flex justify-center bg-gray-50 dark:bg-gray-900/30">
                          <div className="w-full max-w-[820px] bg-white dark:bg-white rounded-2xl border border-gray-200 shadow-[0_18px_40px_rgba(17,24,39,0.10)] p-6">
                            <div
                              style={{ lineHeight, fontSize: `${fontSize}px`, fontFamily, color: "#111827" }}
                              dangerouslySetInnerHTML={{ __html: editorHtml }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                    PDF preview not available.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 md:p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyCommand("undo")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Undo"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("redo")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Redo"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="w-px h-7 bg-gray-200 dark:bg-gray-600 mx-1" />
                    <button
                      type="button"
                      onClick={() => applyCommand("bold")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("italic")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("underline")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Underline"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("indent")}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold"
                    >
                      Indent
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("outdent")}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold"
                    >
                      Outdent
                    </button>
                    <div className="w-px h-7 bg-gray-200 dark:bg-gray-600 mx-1" />
                    <button
                      type="button"
                      onClick={() => applyCommand("formatBlock", "H1")}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold flex items-center gap-2"
                    >
                      <Type className="w-4 h-4" />
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("formatBlock", "H2")}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold flex items-center gap-2"
                    >
                      <Type className="w-4 h-4" />
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("formatBlock", "P")}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold flex items-center gap-2"
                    >
                      <Type className="w-4 h-4" />
                      Normal
                    </button>
                    <div className="w-px h-7 bg-gray-200 dark:bg-gray-600 mx-1" />
                    <button
                      type="button"
                      onClick={() => applyCommand("justifyLeft")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Align Left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("justifyCenter")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Align Center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("justifyRight")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Align Right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                    <div className="w-px h-7 bg-gray-200 dark:bg-gray-600 mx-1" />
                    <button
                      type="button"
                      onClick={() => applyCommand("insertUnorderedList")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Bullets"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCommand("insertOrderedList")}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label="Numbered list"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px h-7 bg-gray-200 dark:bg-gray-600 mx-1" />
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold outline-none"
                      aria-label="Font family"
                    >
                      <option value="system-ui">System</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Times New Roman, Times, serif">Times</option>
                      <option value="Arial, Helvetica, sans-serif">Arial</option>
                      <option value="Courier New, Courier, monospace">Courier</option>
                    </select>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold outline-none"
                      aria-label="Font size"
                    >
                      <option value="12">12</option>
                      <option value="14">14</option>
                      <option value="16">16</option>
                      <option value="18">18</option>
                      <option value="20">20</option>
                      <option value="24">24</option>
                      <option value="28">28</option>
                    </select>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Text</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          const next = e.target.value;
                          setTextColor(next);
                          applyCommand("foreColor", next);
                        }}
                        className="h-6 w-8 bg-transparent"
                        aria-label="Text color"
                      />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">HL</span>
                      <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => {
                          const next = e.target.value;
                          setHighlightColor(next);
                          applyCommand("hiliteColor", next);
                        }}
                        className="h-6 w-8 bg-transparent"
                        aria-label="Highlight color"
                      />
                    </div>
                    <select
                      value={lineHeight}
                      onChange={(e) => setLineHeight(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold outline-none"
                      aria-label="Line spacing"
                    >
                      <option value="1.3">Line 1.3</option>
                      <option value="1.5">Line 1.5</option>
                      <option value="1.6">Line 1.6</option>
                      <option value="1.8">Line 1.8</option>
                      <option value="2">Line 2.0</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={extractTextFromPdf}
                      disabled={isExtracting || (!pdfUrl && files.length === 0)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                        isExtracting || (!pdfUrl && files.length === 0)
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-brand-600 hover:bg-brand-700 text-white"
                      }`}
                    >
                      {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      Extract Text
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const plain = editorRef.current ? editorRef.current.innerText : rawText;
                        setRawText(plain || "");
                        setEditorHtml(toNotesHtml(plain || ""));
                        setActiveView("editor");
                        setShowImportText(false);
                        window.setTimeout(() => editorRef.current?.focus(), 0);
                      }}
                      disabled={!editorHtml.trim() && !rawText.trim()}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                        !editorHtml.trim() && !rawText.trim()
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900"
                      }`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Clean Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImportText((v) => !v)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <Type className="w-4 h-4" />
                      {showImportText ? "Hide Text" : "Import Text"}
                    </button>
                    <button
                      type="button"
                      onClick={resetEditor}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={saveEditor}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={downloadEditedPdf}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Download (PDF)
                    </button>
                    <button
                      type="button"
                      onClick={downloadAsWord}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Word
                    </button>
                    <button
                      type="button"
                      onClick={downloadAsHtml}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      HTML
                    </button>
                    {savedHint && (
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">{savedHint}</span>
                    )}
                    {!savedHint && autoSavedAt > 0 && (
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Auto-saved</span>
                    )}
                  </div>
                </div>

                {extractError && (
                  <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-200">
                    {extractError}
                  </div>
                )}

                {showImportText && (
                  <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Paste extracted text (from PDF) and convert into professional study notes.
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const html = toNotesHtml(rawText);
                            setEditorHtml(html);
                            setShowImportText(false);
                            window.setTimeout(() => editorRef.current?.focus(), 0);
                          }}
                          disabled={!rawText.trim()}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                            rawText.trim()
                              ? "bg-brand-600 hover:bg-brand-700 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Convert to Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => setRawText("")}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Clear
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Paste raw PDF text here… (You can copy text from the PDF viewer or from your backend extraction)"
                      className="mt-3 w-full min-h-[140px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Live Preview
                    </div>
                    <div
                      className="p-4"
                      style={{ lineHeight, fontSize: `${fontSize}px`, fontFamily, color: effectiveTextColor }}
                      dangerouslySetInnerHTML={{ __html: editorHtml }}
                    />
                  </div>

                  <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Edit Content
                    </div>
                    <div
                      ref={editorRef}
                      className="p-4 min-h-[480px] outline-none text-gray-800 dark:text-gray-100"
                      style={{ lineHeight, fontSize: `${fontSize}px`, fontFamily, color: effectiveTextColor }}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={() => setEditorHtml(editorRef.current ? editorRef.current.innerHTML : "")}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
