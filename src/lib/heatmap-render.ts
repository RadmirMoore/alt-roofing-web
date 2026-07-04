import type { HeatmapResponse } from "../types/analytics";

// Blue -> cyan -> green -> yellow -> red palette, the conventional heatmap ramp.
const GRADIENT_STOPS: Array<[number, string]> = [
  [0.0, "rgba(0,0,255,0)"],
  [0.2, "rgba(0,0,255,1)"],
  [0.45, "rgba(0,255,255,1)"],
  [0.65, "rgba(0,255,0,1)"],
  [0.85, "rgba(255,255,0,1)"],
  [1.0, "rgba(255,0,0,1)"],
];

let gradientCache: Uint8ClampedArray | null = null;

/** 256-entry RGBA lookup table for mapping intensity -> color. */
function paletteLookup(): Uint8ClampedArray {
  if (gradientCache) return gradientCache;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  for (const [stop, color] of GRADIENT_STOPS) grad.addColorStop(stop, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1, 256);
  gradientCache = ctx.getImageData(0, 0, 1, 256).data;
  return gradientCache;
}

/**
 * A soft radial brush drawn via shadow offset (the simpleheat trick): the real
 * arc sits off-canvas and only its blurred shadow lands on the bitmap, giving a
 * smooth falloff without per-pixel gradient math.
 */
function makeBrush(radius: number, blur: number): HTMLCanvasElement {
  const r2 = radius + blur;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = r2 * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
  ctx.shadowBlur = blur;
  ctx.shadowColor = "black";
  ctx.beginPath();
  ctx.arc(-r2, -r2, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  return canvas;
}

/** Recolor the accumulated grayscale intensity into the heat palette. */
function colorize(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const pixels = image.data;
  const palette = paletteLookup();
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha === 0) continue;
    const offset = alpha * 4;
    pixels[i] = palette[offset];
    pixels[i + 1] = palette[offset + 1];
    pixels[i + 2] = palette[offset + 2];
    // Keep the page beneath faintly visible; hot cores stay near-opaque.
    pixels[i + 3] = Math.round(alpha * 0.85);
  }
  ctx.putImageData(image, 0, 0);
}

function renderPointHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: HeatmapResponse,
) {
  if (data.cells.length === 0 || data.maxWeight <= 0) return;

  const cellW = width / data.grid.cols;
  const cellH = height / data.grid.rows;
  const radius = Math.max(6, Math.min(cellW, cellH) * 0.9);
  const blur = radius * 0.9;
  const brush = makeBrush(radius, blur);
  const r2 = radius + blur;
  const minOpacity = 0.05;

  for (const cell of data.cells) {
    const cx = (cell.x + 0.5) * cellW;
    const cy = (cell.y + 0.5) * cellH;
    ctx.globalAlpha = Math.min(1, Math.max(minOpacity, cell.w / data.maxWeight));
    ctx.drawImage(brush, cx - r2, cy - r2);
  }
  ctx.globalAlpha = 1;
  colorize(ctx, width, height);
}

function renderScrollHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: HeatmapResponse,
) {
  const bandH = height / data.grid.rows;
  const palette = paletteLookup();

  for (const cell of data.cells) {
    const reach = Math.min(1, Math.max(0, cell.w));
    const idx = Math.round(reach * 255) * 4;
    const r = palette[idx];
    const g = palette[idx + 1];
    const b = palette[idx + 2];
    ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
    ctx.fillRect(0, cell.y * bandH, width, bandH + 1);

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "600 12px system-ui, sans-serif";
    ctx.fillText(
      `${Math.round(reach * 100)}%`,
      10,
      cell.y * bandH + bandH / 2 + 4,
    );
  }
}

/**
 * Draw a heatmap onto `canvas`. The caller must size the canvas bitmap
 * (`canvas.width` / `canvas.height`) to the reference dimensions before calling.
 */
export function renderHeatmap(canvas: HTMLCanvasElement, data: HeatmapResponse) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  if (data.type === "scroll") {
    renderScrollHeatmap(ctx, width, height, data);
  } else {
    renderPointHeatmap(ctx, width, height, data);
  }
}
