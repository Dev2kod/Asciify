import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  RotateCcw,
  Palette,
  SunMoon,
  Check,
  Plus,
  X,
  BookmarkPlus,
  Pencil,
} from 'lucide-react';
import { getModes, sanitizeRamp, DEFAULT_CUSTOM_RAMP } from '../lib/asciiConverter';

const modes = getModes();

function Section({ title, children, defaultOpen = true, right }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-white/5 first:border-t-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 group"
      >
        <span className="label-caps">{title}</span>
        <div className="flex items-center gap-2">
          {right}
          <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={13} className="text-ink-400 group-hover:text-ink-200 transition-colors" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModeCard({ mode, isActive, onSelect, disabled, extraContent, customPreview }) {
  const [hovered, setHovered] = useState(false);
  const showExpand = hovered || isActive;
  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative w-full text-left rounded-xl overflow-hidden
        transition-colors duration-200
        ${isActive
          ? 'bg-accent-500/10 border border-accent-500/30'
          : 'bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      <button
        onClick={() => onSelect(mode.key)}
        disabled={disabled}
        className={`w-full text-left ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="px-3.5 py-2.5 flex items-center gap-3">
          <div
            className={`
              font-mono text-[11px] tracking-widest px-2 py-1 rounded-md border flex-shrink-0
              ${isActive
                ? 'border-accent-500/40 text-accent-300 bg-accent-500/10'
                : 'border-white/5 text-ink-400 bg-white/[0.02]'}
            `}
            style={{ minWidth: 58, textAlign: 'center' }}
          >
            {(customPreview ?? mode.preview).slice(0, 4) || '...'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[13.5px] font-medium ${isActive ? 'text-ink-50' : 'text-ink-100'}`}>
              {mode.name}
            </p>
          </div>
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="w-4 h-4 rounded-full bg-accent-400 flex items-center justify-center flex-shrink-0"
              >
                <Check size={10} strokeWidth={3} className="text-ink-950" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {showExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3 pt-0 text-[12px] text-ink-400 leading-relaxed">
              {mode.description}
            </div>
            {isActive && extraContent && (
              <div className="px-3.5 pb-3.5 pt-1">{extraContent}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CustomRampEditor({
  value,
  onChange,
  presets,
  onSavePreset,
  onSelectPreset,
  onDeletePreset,
  activePresetId,
  disabled,
}) {
  const [focused, setFocused] = useState(false);
  const charCount = Array.from(value || '').length;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-ink-400 flex items-center gap-1.5">
            <Pencil size={10} />
            Your ramp
            <span className="text-ink-600">&middot;</span>
            <span className="italic-serif text-ink-400">dark</span>
            <span className="text-ink-600">&rarr;</span>
            <span className="italic-serif text-ink-200">light</span>
          </span>
          <span className="text-[10.5px] font-mono text-ink-500">
            {charCount} chars
          </span>
        </div>
        <div
          className={`
            flex items-stretch rounded-lg overflow-hidden border transition-colors
            ${focused ? 'border-accent-500/50 bg-ink-900/60' : 'border-white/5 bg-ink-900/40'}
          `}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            placeholder=" .:-=+*#%@"
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent px-3 py-2 text-[13px] font-mono text-ink-100 placeholder:text-ink-600 outline-none min-w-0"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSavePreset}
            disabled={disabled || charCount < 2}
            title="Save as preset"
            className="px-2.5 flex items-center gap-1 text-[11px] text-ink-300 hover:text-accent-300 hover:bg-white/[0.04] transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-l border-white/5"
          >
            <BookmarkPlus size={12} />
          </motion.button>
        </div>
      </div>

      {presets.length > 0 && (
        <div>
          <span className="text-[11px] text-ink-500 block mb-1.5">Saved presets</span>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence initial={false}>
              {presets.map((p) => {
                const isSelected = activePresetId === p.id;
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.18 }}
                    className={`
                      group relative flex items-center rounded-md border overflow-hidden
                      ${isSelected
                        ? 'border-accent-500/40 bg-accent-500/10'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'}
                    `}
                  >
                    <button
                      onClick={() => onSelectPreset(p)}
                      disabled={disabled}
                      className={`
                        px-2 py-1 font-mono text-[10.5px] tracking-wide truncate max-w-[120px]
                        ${isSelected ? 'text-accent-200' : 'text-ink-300'}
                      `}
                      title={p.ramp}
                    >
                      {p.ramp.length > 12 ? p.ramp.slice(0, 12) + '…' : p.ramp}
                    </button>
                    <button
                      onClick={() => onDeletePreset(p.id)}
                      disabled={disabled}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-1 py-1 text-ink-500 hover:text-red-300"
                      title="Delete preset"
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      <p className="text-[11px] text-ink-500 leading-relaxed">
        Tip: First character is used for the darkest pixels.
        Try <code className="font-mono text-ink-300 bg-white/5 px-1 rounded">{" "}.:-=+*#%@</code> or emoji like <code className="font-mono text-ink-300 bg-white/5 px-1 rounded">{" "}★☆✦✧</code>.
      </p>
    </div>
  );
}

function Slider({ label, value, min, max, unit = '', onChange, disabled, step = 1 }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12.5px] text-ink-300">{label}</span>
        <span className="text-[11px] font-mono text-ink-400">
          {typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
      />
    </div>
  );
}

function Toggle({ icon: Icon, label, value, onChange, disabled }) {
  return (
    <button
      onClick={() => onChange(!value)}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 py-2.5 px-3 rounded-xl
        transition-all duration-200 text-[13.5px]
        ${value
          ? 'bg-accent-500/10 text-ink-50 border border-accent-500/25'
          : 'bg-white/[0.02] border border-white/5 text-ink-300 hover:border-white/10 hover:text-ink-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <Icon size={15} className={value ? 'text-accent-400' : ''} />
      <span className="flex-1 text-left font-medium">{label}</span>
      <div
        className={`
          relative w-8 h-4 rounded-full transition-colors duration-200
          ${value ? 'bg-accent-500' : 'bg-ink-600'}
        `}
      >
        <motion.div
          layout
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm"
          style={{ left: value ? '18px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

const PRESETS_KEY = 'asciify.customPresets';

const DEFAULT_PRESETS = [
  { id: 'p1', ramp: ' .oO@' },
  { id: 'p2', ramp: ' ▁▃▅▇█' },
  { id: 'p3', ramp: ' ★☆✦✧' },
];

function loadPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return DEFAULT_PRESETS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
}

export default function ControlPanel({ settings, onSettingsChange, disabled }) {
  const update = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  const updateMany = (patch) => {
    onSettingsChange({ ...settings, ...patch });
  };

  const activeMode = modes.find((m) => m.key === settings.mode);

  const [presets, setPresets] = useState(() => loadPresets());

  const persistPresets = (next) => {
    setPresets(next);
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
    } catch {
      // ignore quota
    }
  };

  const handleSavePreset = () => {
    const clean = sanitizeRamp(settings.customRamp || '');
    if (clean.length < 2) return;
    if (presets.some((p) => p.ramp === clean)) return;
    const next = [...presets, { id: 'p' + Date.now().toString(36), ramp: clean }];
    persistPresets(next);
  };

  const handleSelectPreset = (preset) => {
    updateMany({
      mode: 'custom',
      customRamp: preset.ramp,
      activePresetId: preset.id,
    });
  };

  const handleDeletePreset = (id) => {
    persistPresets(presets.filter((p) => p.id !== id));
    if (settings.activePresetId === id) {
      update('activePresetId', null);
    }
  };

  return (
    <div>
      <Section
        title="Style"
        right={
          <span className="mono-badge">{activeMode?.name || 'Standard'}</span>
        }
      >
        <div className="flex flex-col gap-1.5">
          {modes.map((mode) => {
            const isActive = settings.mode === mode.key;
            const isCustom = mode.key === 'custom';
            return (
              <ModeCard
                key={mode.key}
                mode={mode}
                isActive={isActive}
                onSelect={(key) => {
                  if (key === 'custom' && !settings.customRamp) {
                    updateMany({ mode: 'custom', customRamp: DEFAULT_CUSTOM_RAMP });
                  } else {
                    update('mode', key);
                  }
                }}
                disabled={disabled}
                customPreview={
                  isCustom
                    ? (settings.customRamp && settings.customRamp.length >= 2
                        ? settings.customRamp
                        : 'abc')
                    : undefined
                }
                extraContent={
                  isCustom ? (
                    <CustomRampEditor
                      value={settings.customRamp || ''}
                      onChange={(v) => updateMany({ customRamp: v, activePresetId: null })}
                      presets={presets}
                      activePresetId={settings.activePresetId}
                      onSavePreset={handleSavePreset}
                      onSelectPreset={handleSelectPreset}
                      onDeletePreset={handleDeletePreset}
                      disabled={disabled}
                    />
                  ) : null
                }
              />
            );
          })}
        </div>
      </Section>

      <Section title="Resolution">
        <Slider
          label="Columns"
          value={settings.cols}
          min={30}
          max={220}
          onChange={(v) => update('cols', v)}
          disabled={disabled}
        />
        <Slider
          label="Font size"
          value={settings.fontSize}
          min={2}
          max={18}
          unit="px"
          onChange={(v) => update('fontSize', v)}
          disabled={disabled}
        />
      </Section>

      <Section title="Adjustments">
        <Slider
          label="Contrast"
          value={settings.contrast}
          min={0.5}
          max={2}
          step={0.05}
          unit="x"
          onChange={(v) => update('contrast', v)}
          disabled={disabled}
        />
        <Slider
          label="Brightness"
          value={settings.brightness}
          min={-0.3}
          max={0.3}
          step={0.02}
          onChange={(v) => update('brightness', v)}
          disabled={disabled}
        />
      </Section>

      <Section title="Options">
        <div className="flex flex-col gap-2">
          <Toggle
            icon={SunMoon}
            label="Invert brightness"
            value={settings.invert}
            onChange={(v) => update('invert', v)}
            disabled={disabled}
          />
          <Toggle
            icon={Palette}
            label="Preserve color"
            value={settings.colored}
            onChange={(v) => update('colored', v)}
            disabled={disabled}
          />
        </div>
      </Section>

      <div className="pt-5 border-t border-white/5 mt-1">
        <motion.button
          whileHover={{ x: 1 }}
          onClick={() =>
            onSettingsChange({
              mode: 'standard',
              cols: 100,
              fontSize: 7,
              invert: false,
              colored: false,
              contrast: 1,
              brightness: 0,
              customRamp: DEFAULT_CUSTOM_RAMP,
              activePresetId: null,
            })
          }
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 py-2 text-[12.5px] text-ink-400 hover:text-ink-100 transition-colors"
        >
          <RotateCcw size={13} />
          <span>Reset all settings</span>
        </motion.button>
      </div>
    </div>
  );
}
