import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Command } from 'lucide-react';
import Logo from './components/Logo';
import ImageUploader from './components/ImageUploader';
import ControlPanel from './components/ControlPanel';
import AsciiOutput from './components/AsciiOutput';
import { ToastProvider } from './components/Toast';
import {
  convertToAscii,
  loadImageFromFile,
  getImageData,
  DEFAULT_CUSTOM_RAMP,
} from './lib/asciiConverter';

const DEFAULT_SETTINGS = {
  mode: 'standard',
  cols: 100,
  fontSize: 7,
  invert: false,
  colored: false,
  contrast: 1,
  brightness: 0,
  customRamp: DEFAULT_CUSTOM_RAMP,
  activePresetId: null,
};

function AppBody() {
  const [currentImage, setCurrentImage] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [asciiData, setAsciiData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const imageDataRef = useRef(null);

  const processImage = useCallback(() => {
    if (!imageDataRef.current) return;
    setProcessing(true);
    requestAnimationFrame(() => {
      const { data, width, height } = imageDataRef.current;
      const result = convertToAscii(data, width, height, settings);
      setAsciiData(result);
      setProcessing(false);
    });
  }, [settings]);

  useEffect(() => {
    if (imageDataRef.current) processImage();
  }, [processImage]);

  const handleImageLoad = useCallback(async (file) => {
    if (!file) {
      setCurrentImage(null);
      setAsciiData(null);
      imageDataRef.current = null;
      return;
    }

    try {
      setProcessing(true);
      const img = await loadImageFromFile(file);
      const imgData = getImageData(img, 800);
      imageDataRef.current = imgData;

      setCurrentImage({
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
        preview: URL.createObjectURL(file),
      });

      const result = convertToAscii(imgData.data, imgData.width, imgData.height, DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      setAsciiData(result);
      setProcessing(false);
    } catch (err) {
      console.error('Failed to load image:', err);
      setProcessing(false);
    }
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="page-bg" />
      <div className="page-grid" />

      {/* Top nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/60 border-b border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:inline-flex items-center h-5 px-2 rounded-full border border-white/5 bg-white/[0.02] text-[10.5px] text-ink-400 tracking-wide">
              by <span className="italic-serif text-accent-300 ml-1">Devesh</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a
              className="btn-ghost"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              <Star size={13} />
              <span>Star on GitHub</span>
            </a>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              onClick={() => document.querySelector('input[type=file]')?.click()}
            >
              <Sparkles size={13} />
              <span>New image</span>
            </motion.button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-5 md:px-8 pt-10 pb-16">
        <AnimatePresence mode="wait">
          {!currentImage ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              {/* Hero */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 mb-6"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-accent-400 animate-pulse-soft" />
                    <span className="relative rounded-full h-1.5 w-1.5 bg-accent-400" />
                  </span>
                  <span className="text-[11.5px] text-ink-300 tracking-wide">
                    Client-side rendering &middot; No uploads
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="text-[44px] md:text-[56px] leading-[1.05] tracking-[-0.03em] font-semibold text-ink-50"
                >
                  Images, into{' '}
                  <span className="italic-serif text-accent-300 font-normal">
                    text art.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="mt-4 text-[16px] md:text-[17px] text-ink-300 max-w-md mx-auto leading-relaxed"
                >
                  Drop an image and watch it transform into ASCII with nine
                  distinct styles. Tune it, then export as PNG, text, or HTML.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <ImageUploader onImageLoad={handleImageLoad} currentImage={null} />
              </motion.div>

              {/* Footer-hints row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex items-center justify-center gap-6 flex-wrap text-[12px] text-ink-500"
              >
                <FeatureChip label="9 styles" />
                <FeatureChip label="Live preview" />
                <FeatureChip label="Color support" />
                <FeatureChip label="One-click export" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6"
            >
              {/* Left column — sidebar pins on desktop; image stays visible while controls scroll */}
              <aside
                className="flex flex-col gap-4 lg:sticky lg:top-[72px]"
                style={{ maxHeight: 'calc(100vh - 92px)' }}
              >
                <div className="flex-shrink-0">
                  <ImageUploader onImageLoad={handleImageLoad} currentImage={currentImage} />
                </div>

                <div className="card p-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
                  <ControlPanel
                    settings={settings}
                    onSettingsChange={setSettings}
                    disabled={processing}
                  />
                </div>
              </aside>

              {/* Output column */}
              <section>
                {processing && !asciiData ? (
                  <div className="card h-[50vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
                        <div className="absolute inset-0 border-2 border-t-accent-400 rounded-full animate-spin" />
                      </div>
                      <p className="text-[13px] text-ink-400">Processing image&hellip;</p>
                    </div>
                  </div>
                ) : (
                  <AsciiOutput
                    asciiData={asciiData}
                    fontSize={settings.fontSize}
                    colored={settings.colored}
                  />
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-5">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 flex items-center justify-between text-[12px] text-ink-500 flex-wrap gap-3">
          <p className="flex items-center gap-2">
            <span>Crafted by</span>
            <span className="italic-serif text-accent-300 text-[14px] leading-none">
              Devesh
            </span>
            <span className="text-ink-700">&middot;</span>
            <span>All processing happens in your browser.</span>
          </p>
          <div className="flex items-center gap-1.5">
            <kbd className="mono-badge">
              <Command size={10} className="inline mr-0.5" /> C
            </kbd>
            <span>to copy output</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureChip({ label }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="flex items-center gap-1.5 text-ink-400"
    >
      <span className="w-1 h-1 rounded-full bg-accent-400/70" />
      {label}
    </motion.div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppBody />
    </ToastProvider>
  );
}
