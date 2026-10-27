import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { siteCopy } from "../data/content";
import { FadeIn } from "./ui";

const frameClassName =
  "relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]";

function Player({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const { videoTitle } = siteCopy.reviews;

  return (
    <>
      <video
        ref={videoRef}
        className={`w-full bg-black object-cover ${className}`}
        poster={poster}
        controls={started}
        playsInline
        preload="none"
        aria-label={videoTitle}
        onPlay={() => setStarted(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      {started ? null : (
        <button
          type="button"
          onClick={() => videoRef.current?.play()}
          className="group absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/15"
          aria-label={`Play video: ${videoTitle}`}
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground transition group-hover:scale-105 cobalt-glow">
            <Play className="ml-1 h-8 w-8 fill-current" aria-hidden="true" />
          </span>
        </button>
      )}
    </>
  );
}

// Phones get the vertical, captioned cut; wider screens get the full
// landscape cut. preload="none" keeps the hidden one from downloading.
export function TestimonialVideo() {
  const { videoTitle, videoCaption } = siteCopy.reviews;

  return (
    <FadeIn className="mb-14 md:mb-20">
      <div className={`mx-auto max-w-xs md:hidden ${frameClassName}`}>
        <Player
          src="/videos/testimonial-vertical.mp4"
          poster="/images/testimonial-vertical-poster.jpg"
          className="aspect-[9/16]"
        />
      </div>
      <div className={`hidden md:block ${frameClassName}`}>
        <Player
          src="/videos/testimonial-wide.mp4"
          poster="/images/testimonial-wide-poster.jpg"
          className="aspect-video"
        />
      </div>
      <p className="mt-4 text-center text-sm text-foreground/60 md:text-left">
        <span className="font-semibold text-foreground">{videoTitle}</span>
        {" · "}
        {videoCaption}
      </p>
    </FadeIn>
  );
}
