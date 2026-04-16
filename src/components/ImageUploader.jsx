import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ImagePlus, X, ImageIcon } from 'lucide-react';
import { useToast } from './Toast';

const ACCEPTED_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/avif',
  'image/ico',
  'image/x-icon',
];

const FORMAT_LABELS = ['JPEG', 'PNG', 'SVG', 'WebP', 'GIF', 'BMP', 'AVIF'];

export default function ImageUploader({ onImageLoad, currentImage }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast('Please upload a valid image file', 'error');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast('File too large. Max size is 50MB', 'error');
        return;
      }
      onImageLoad(file);
    },
    [onImageLoad, toast]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleClick = () => fileInputRef.current?.click();

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!currentImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative cursor-pointer group"
          >
            {/* Dotted border wrapper */}
            <motion.div
              animate={
                isDragging
                  ? { scale: 1.01 }
                  : { scale: 1 }
              }
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`
                relative rounded-2xl overflow-hidden
                transition-all duration-300
                ${isDragging ? 'glow-ring' : ''}
              `}
              style={{
                background: isDragging
                  ? 'rgba(245, 178, 14, 0.04)'
                  : 'rgba(20, 20, 19, 0.4)',
                border: `1px dashed ${isDragging ? 'rgba(245, 178, 14, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Animated corner markers */}
              {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                <motion.div
                  key={pos}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isDragging ? 1 : 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`absolute ${pos} w-3 h-3 pointer-events-none`}
                >
                  <div className="absolute inset-0 border-accent-400"
                    style={{
                      borderTopWidth: pos.includes('top') ? 1.5 : 0,
                      borderLeftWidth: pos.includes('left') ? 1.5 : 0,
                      borderBottomWidth: pos.includes('bottom') ? 1.5 : 0,
                      borderRightWidth: pos.includes('right') ? 1.5 : 0,
                    }}
                  />
                </motion.div>
              ))}

              <div className="flex flex-col items-center text-center py-16 px-8">
                <motion.div
                  animate={
                    isDragging
                      ? { y: -6, scale: 1.08 }
                      : { y: 0, scale: 1 }
                  }
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative"
                >
                  <div
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center
                      transition-all duration-300
                      ${isDragging
                        ? 'bg-accent-500/15 text-accent-300'
                        : 'bg-white/5 text-ink-300 group-hover:text-ink-100 group-hover:bg-white/8'}
                    `}
                  >
                    <motion.div
                      animate={isDragging ? { rotate: [0, -8, 8, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Upload size={22} strokeWidth={1.5} />
                    </motion.div>
                  </div>
                </motion.div>

                <div className="mt-5">
                  <p className="text-[15px] font-medium text-ink-100">
                    {isDragging ? 'Release to upload' : 'Drop an image, or '}
                    {!isDragging && (
                      <span className="italic-serif text-accent-400 relative">
                        click to browse
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[13px] text-ink-400">
                    PNG, JPEG, SVG, WebP, GIF and more
                    <span className="mx-1.5 text-ink-600">&middot;</span>
                    up to 50MB
                  </p>
                </div>

                <motion.div
                  initial={false}
                  animate={{ opacity: isDragging ? 0 : 1 }}
                  className="flex flex-wrap justify-center gap-1.5 mt-5"
                >
                  {FORMAT_LABELS.map((fmt) => (
                    <span key={fmt} className="mono-badge">
                      {fmt}
                    </span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="card p-3 flex items-center gap-4"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-ink-800 ring-1 ring-white/5">
              <img
                src={currentImage.preview}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ImageIcon size={13} className="text-ink-400 flex-shrink-0" />
                <p className="text-[13.5px] font-medium text-ink-100 truncate">
                  {currentImage.name}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11.5px] text-ink-400 font-mono">
                  {currentImage.width} &times; {currentImage.height}
                </span>
                <span className="text-ink-700">&middot;</span>
                <span className="text-[11.5px] text-ink-400 font-mono">
                  {(currentImage.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="p-2 rounded-lg text-ink-300 hover:text-ink-100 hover:bg-white/5 transition-colors"
                title="Replace image"
              >
                <ImagePlus size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageLoad(null);
                }}
                className="p-2 rounded-lg text-ink-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                title="Remove"
              >
                <X size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
