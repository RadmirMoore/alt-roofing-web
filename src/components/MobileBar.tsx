import { ArrowRight, Phone } from "lucide-react";
import { PHONE_HREF } from "../data/content";

export function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-2 gap-3">
        <a
          href={PHONE_HREF}
          className="flex h-14 items-center justify-center gap-2 rounded-full border border-border py-3.5 text-sm font-semibold"
        >
          <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
          Call Now
        </a>
        <a
          href="#quote"
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
        >
          Free Quote
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
