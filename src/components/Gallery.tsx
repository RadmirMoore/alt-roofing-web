import { galleryImages, siteCopy, type GalleryImage } from "../data/content";
import { FadeIn, SectionLabel } from "./ui";

function GalleryRow({
  images,
  reverse = false,
}: {
  images: readonly GalleryImage[];
  reverse?: boolean;
}) {
  const track = [...images, ...images];

  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex w-max gap-4 md:gap-6 ${reverse ? "animate-slide-reverse" : "animate-slide"}`}
      >
        {track.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className="relative h-52 w-[280px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card md:h-72 md:w-[420px]"
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Gallery() {
  return (
    <section id="gallery" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <FadeIn className="mb-14 max-w-3xl md:mb-20">
          <SectionLabel>{siteCopy.gallery.label}</SectionLabel>
          <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl">
            {siteCopy.gallery.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/65">
            {siteCopy.gallery.intro}
          </p>
        </FadeIn>
      </div>

      <div className="space-y-4 md:space-y-6">
        <GalleryRow images={galleryImages} />
        <GalleryRow images={[...galleryImages].reverse()} reverse />
      </div>
    </section>
  );
}
