import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  FileText,
  FileImage,
  FileCode,
  Check,
  Share2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { asciiToPlainText } from '../lib/asciiConverter';
import { useToast } from './Toast';

export default function AsciiOutput({ asciiData, fontSize, colored }) {
  const outputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const toast = useToast();

  if (!asciiData || asciiData.length === 0) return null;

  const plainText = asciiToPlainText(asciiData);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = plainText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast('Copied ASCII to clipboard');
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSaveText = () => {
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asciify.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast('Saved as asciify.txt');
    setExportOpen(false);
  };

  const handleSaveImage = () => {
    const lines = asciiData;
    // Render at a larger font size so the PNG stays crisp when zoomed.
    // Floor for small font sizes so every character has enough pixels.
    const EXPORT_FONT_SIZE = Math.max(fontSize * 4, 32);
    const charWidth = EXPORT_FONT_SIZE * 0.62;
    const lineHeight = EXPORT_FONT_SIZE * 1.05;
    const pad = Math.round(EXPORT_FONT_SIZE * 2);
    const width = Math.ceil(lines[0].length * charWidth) + pad * 2;
    const height = Math.ceil(lines.length * lineHeight) + pad * 2;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a09';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${EXPORT_FONT_SIZE}px "JetBrains Mono", "Courier New", monospace`;
    ctx.textBaseline = 'top';
    ctx.textRendering = 'geometricPrecision';
    ctx.imageSmoothingEnabled = false;

    lines.forEach((line, row) => {
      line.forEach((cell, col) => {
        ctx.fillStyle = colored && cell.color ? cell.color : '#e8e8e6';
        ctx.fillText(cell.char, pad + col * charWidth, pad + row * lineHeight);
      });
    });

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asciify.png';
      a.click();
      URL.revokeObjectURL(url);
      toast('Saved as asciify.png');
      setExportOpen(false);
    }, 'image/png');
  };

  const escapeHtml = (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c;

  const handleSaveHTML = () => {
    let html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Asciify Art</title>
<style>
body { background: #0a0a09; display: flex; justify-content: center; padding: 48px; margin: 0; }
pre { font-family: "JetBrains Mono", "Courier New", monospace; font-size: ${fontSize}px; line-height: 1.05; letter-spacing: 0.05em; color: #e8e8e6; margin: 0; }
</style></head><body><pre>`;

    if (colored) {
      asciiData.forEach((line) => {
        line.forEach((cell) => {
          if (cell.color) {
            html += `<span style="color:${cell.color}">${escapeHtml(cell.char)}</span>`;
          } else {
            html += escapeHtml(cell.char);
          }
        });
        html += '\n';
      });
    } else {
      html += plainText.replace(/[<>&]/g, escapeHtml);
    }

    html += '</pre></body></html>';

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asciify.html';
    a.click();
    URL.revokeObjectURL(url);
    toast('Saved as asciify.html');
    setExportOpen(false);
  };

  const rows = asciiData.length;
  const cols = asciiData[0]?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col gap-3"
    >
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="mono-badge">
            {rows} &times; {cols}
          </span>
          <span className="text-[12px] text-ink-500">
            {rows * cols} chars
          </span>
        </div>

        <div className="flex items-center gap-1.5 relative">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCopy}
            className="btn-ghost"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="flex items-center gap-1.5 text-accent-300"
                >
                  <Check size={13} strokeWidth={2.5} />
                  <span>Copied</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setExpanded((e) => !e)}
            className="btn-ghost"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{expanded ? 'Collapse' : 'Expand'}</span>
          </motion.button>

          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setExportOpen((o) => !o)}
              className="btn-accent"
            >
              <Share2 size={13} />
              <span>Export</span>
            </motion.button>

            <AnimatePresence>
              {exportOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setExportOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 card p-1.5 z-20 shadow-2xl"
                  >
                    <ExportItem
                      icon={FileImage}
                      label="PNG Image"
                      hint="Perfect for sharing"
                      onClick={handleSaveImage}
                    />
                    <ExportItem
                      icon={FileText}
                      label="Plain Text"
                      hint=".txt file"
                      onClick={handleSaveText}
                    />
                    <ExportItem
                      icon={FileCode}
                      label="HTML"
                      hint={colored ? 'Preserves color' : '.html file'}
                      onClick={handleSaveHTML}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Output canvas */}
      <motion.div
        layout
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="card relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-ink-900/80 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-ink-900/80 to-transparent pointer-events-none z-10" />

        <div
          className="overflow-auto p-6"
          style={{
            maxHeight: expanded ? '85vh' : '60vh',
            transition: 'max-height 0.3s ease',
          }}
        >
          <div
            ref={outputRef}
            className="ascii-output text-ink-100 select-text"
            style={{ fontSize: `${fontSize}px` }}
          >
            {asciiData.map((line, rowIdx) => (
              <div key={rowIdx}>
                {colored
                  ? line.map((cell, colIdx) => (
                      <span key={colIdx} style={cell.color ? { color: cell.color } : undefined}>
                        {cell.char}
                      </span>
                    ))
                  : line.map((cell) => cell.char).join('')}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExportItem({ icon: Icon, label, hint, onClick }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
    >
      <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-ink-200">
        <Icon size={14} />
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-medium text-ink-100">{label}</p>
        <p className="text-[11px] text-ink-400">{hint}</p>
      </div>
    </motion.button>
  );
}
