import { motion } from 'framer-motion';

export default function Logo({ size = 28 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-2.5"
    >
      <div
        className="relative flex items-center justify-center rounded-[8px] overflow-hidden"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #f5b20e 0%, #c46b02 100%)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 12px rgba(245, 178, 14, 0.2)',
        }}
      >
        <span
          className="font-mono font-bold text-ink-950"
          style={{ fontSize: size * 0.55, lineHeight: 1 }}
        >
          A
        </span>
        <div
          className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full opacity-40"
          style={{ background: '#0a0a09' }}
        />
      </div>
      <span
        className="font-semibold tracking-tight text-ink-50"
        style={{ fontSize: size * 0.6, letterSpacing: '-0.02em' }}
      >
        Asciify
      </span>
    </motion.div>
  );
}
