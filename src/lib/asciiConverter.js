// Character ramps from darkest to lightest
const CHAR_RAMPS = {
  standard: ' .:-=+*#%@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  minimal: ' .oO@',
  binary: ' █',
  dots: ' ⠁⠃⠇⡇⣇⣧⣷⣿',
  circles: ' ·•◦○◎●◉',
  stars: ' .+*⋆✦✧★',
  matrix: ' 0123456789',
};

export const DEFAULT_CUSTOM_RAMP = ' .:-=+*#%@';

export function sanitizeRamp(str) {
  if (!str) return '';
  // Keep printable characters, normalize
  return Array.from(str).filter((c) => c.length > 0).join('');
}

const MODE_INFO = {
  custom: {
    name: 'Custom',
    description: 'Use your own characters. Save multiple presets and swap between them instantly.',
    preview: 'abc',
  },
  standard: {
    name: 'Standard',
    description: 'Classic ASCII ramp. Works well for most photos and provides balanced detail.',
    preview: '.:-=+*#%@',
  },
  detailed: {
    name: 'Detailed',
    description: 'Extended 70-character set for highest detail and texture fidelity.',
    preview: '.\'`^",:;Il!',
  },
  blocks: {
    name: 'Blocks',
    description: 'Unicode block elements for bold silhouettes and high contrast.',
    preview: '░▒▓█',
  },
  minimal: {
    name: 'Minimal',
    description: 'Just five characters. Clean, poster-like graphic feel.',
    preview: '.oO@',
  },
  binary: {
    name: 'Binary',
    description: 'Two-tone. Pure black and white — maximum contrast.',
    preview: '█',
  },
  dots: {
    name: 'Braille',
    description: 'Braille patterns give a dithered, stipple-like texture.',
    preview: '⠁⠇⣇⣿',
  },
  circles: {
    name: 'Orbs',
    description: 'Filled circles from pinprick to solid — soft, organic look.',
    preview: '·•◦○◉',
  },
  stars: {
    name: 'Starry',
    description: 'Starbursts scale with brightness. Magical, night-sky feel.',
    preview: '.+*★',
  },
  matrix: {
    name: 'Matrix',
    description: 'Digits 0-9 by density. Code-rain, terminal aesthetic.',
    preview: '0123456789',
  },
};

export function getModes() {
  return Object.entries(MODE_INFO).map(([key, info]) => ({
    key,
    ...info,
  }));
}

export function convertToAscii(imageData, width, height, options = {}) {
  const {
    mode = 'standard',
    cols = 100,
    invert = false,
    colored = false,
    contrast = 1,
    brightness = 0,
    customRamp = DEFAULT_CUSTOM_RAMP,
  } = options;

  let ramp;
  if (mode === 'custom') {
    const clean = sanitizeRamp(customRamp);
    ramp = clean.length >= 2 ? clean : DEFAULT_CUSTOM_RAMP;
  } else {
    ramp = CHAR_RAMPS[mode] || CHAR_RAMPS.standard;
  }
  const rampArr = Array.from(ramp); // support unicode multi-byte chars
  const rampLen = rampArr.length;

  const aspectRatio = 0.5;
  const cellWidth = width / cols;
  const cellHeight = cellWidth / aspectRatio;
  const rows = Math.floor(height / cellHeight);

  const result = [];

  for (let row = 0; row < rows; row++) {
    const line = [];
    for (let col = 0; col < cols; col++) {
      const x = Math.floor(col * cellWidth);
      const y = Math.floor(row * cellHeight);

      let rTotal = 0, gTotal = 0, bTotal = 0;
      let samples = 0;
      const sampleSize = Math.max(1, Math.floor(cellWidth / 2));

      for (let sy = 0; sy < sampleSize && (y + sy) < height; sy++) {
        for (let sx = 0; sx < sampleSize && (x + sx) < width; sx++) {
          const idx = ((y + sy) * width + (x + sx)) * 4;
          rTotal += imageData[idx];
          gTotal += imageData[idx + 1];
          bTotal += imageData[idx + 2];
          samples++;
        }
      }

      const r = rTotal / samples;
      const g = gTotal / samples;
      const b = bTotal / samples;

      let brightnessValue = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Apply brightness and contrast adjustments
      brightnessValue = (brightnessValue - 0.5) * contrast + 0.5 + brightness;
      brightnessValue = Math.max(0, Math.min(1, brightnessValue));

      if (invert) {
        brightnessValue = 1 - brightnessValue;
      }

      const charIndex = Math.min(
        Math.floor(brightnessValue * rampLen),
        rampLen - 1
      );
      const char = rampArr[charIndex];

      if (colored) {
        line.push({
          char,
          color: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`,
        });
      } else {
        line.push({ char, color: null });
      }
    }
    result.push(line);
  }

  return result;
}

export function asciiToPlainText(asciiData) {
  return asciiData
    .map((line) => line.map((cell) => cell.char).join(''))
    .join('\n');
}

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getImageData(img, maxWidth = 800) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let w = img.width;
  let h = img.height;

  if (w > maxWidth) {
    h = (maxWidth / w) * h;
    w = maxWidth;
  }

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  return {
    data: ctx.getImageData(0, 0, w, h).data,
    width: w,
    height: h,
  };
}
