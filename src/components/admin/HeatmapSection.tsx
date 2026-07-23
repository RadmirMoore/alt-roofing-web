import { Flame, Loader2, Monitor, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  HeatmapDevice,
  HeatmapResponse,
  HeatmapType,
} from "../../types/analytics";
import { fetchHeatmap } from "../../lib/admin-api";
import { renderHeatmap } from "../../lib/heatmap-render";

const HEATMAP_TYPES: Array<{ key: HeatmapType; label: string; hint: string }> = [
  { key: "click", label: "Clicks", hint: "Where visitors click & tap" },
  { key: "move", label: "Attention", hint: "Where the cursor lingers" },
  { key: "scroll", label: "Scroll", hint: "How far visitors read" },
];

const DEVICE_REF_WIDTH: Record<HeatmapDevice, number> = {
  desktop: 1440,
  mobile: 390,
};

function readFrameHeight(frame: HTMLIFrameElement | null): number | null {
  const doc = frame?.contentDocument;
  if (!doc) return null;
  const height = doc.documentElement.scrollHeight;
  return height > 0 ? height : null;
}

export function HeatmapSection({ days }: { days: number }) {
  const [type, setType] = useState<HeatmapType>("click");
  const [device, setDevice] = useState<HeatmapDevice>("desktop");
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [frameHeight, setFrameHeight] = useState(2400);
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const refWidth = DEVICE_REF_WIDTH[device];

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchHeatmap(days, type, device));
    } catch (loadError) {
      setData(null);
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load heatmap",
      );
    } finally {
      setLoading(false);
    }
  }, [days, type, device]);

  useEffect(() => {
    void load();
  }, [load]);

  // Scale the reference-width preview down to the available admin width so the
  // 1440px desktop frame never forces horizontal scrolling.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / refWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [refWidth]);

  // Re-measure the embedded page height when the reference width changes
  // (device toggle reflows the responsive layout without re-firing onLoad).
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const height = readFrameHeight(frameRef.current);
      if (height) setFrameHeight(height);
    });
    return () => cancelAnimationFrame(raf);
  }, [refWidth]);

  // Paint the heatmap whenever the data or the frame geometry changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    canvas.width = refWidth;
    canvas.height = frameHeight;
    renderHeatmap(canvas, data);
  }, [data, frameHeight, refWidth]);

  const sampleNoun = type === "scroll" ? "sessions" : type === "move" ? "sessions" : "clicks";

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Flame className="h-5 w-5 text-primary" aria-hidden="true" />
            Heatmap
          </h3>
          <p className="mt-1 text-sm text-foreground/60">
            {HEATMAP_TYPES.find((item) => item.key === type)?.hint} · last {days}{" "}
            days ·{" "}
            {data ? `${data.sampleCount} ${sampleNoun} in view` : "loading…"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border bg-card p-1">
            {HEATMAP_TYPES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setType(item.key)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  type === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              aria-label="Desktop"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                device === "desktop"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              aria-label="Mobile"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                device === "mobile"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Mobile
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3 text-xs text-foreground/55">
        <span>{type === "scroll" ? "Fewer readers" : "Fewer"}</span>
        <span
          className="h-2 w-40 rounded-full"
          style={{
            background:
              "linear-gradient(to right, rgb(0,0,255), rgb(0,255,255), rgb(0,255,0), rgb(255,255,0), rgb(255,0,0))",
          }}
        />
        <span>{type === "scroll" ? "More readers" : "More"}</span>
        {loading ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin text-primary" />
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="relative mt-3 w-full overflow-hidden rounded-xl border border-border bg-card"
        style={{ height: frameHeight * scale }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: refWidth,
            height: frameHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            ref={frameRef}
            src="/"
            title="Site preview"
            onLoad={() => {
              const height = readFrameHeight(frameRef.current);
              if (height) setFrameHeight(height);
            }}
            style={{
              width: refWidth,
              height: frameHeight,
              border: 0,
              pointerEvents: "none",
            }}
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute left-0 top-0"
            style={{ width: refWidth, height: frameHeight }}
          />
        </div>
      </div>

      {data && data.sampleCount === 0 ? (
        <p className="mt-3 text-sm text-foreground/50">
          No {sampleNoun} recorded for {device} in this range yet. Browse the site
          on a {device} device to generate data.
        </p>
      ) : null}
    </div>
  );
}
