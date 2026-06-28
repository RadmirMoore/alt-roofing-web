import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = MotionProps & {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-px w-10 bg-primary" />
      <span className="text-xs font-medium uppercase tracking-[0.25em] text-foreground/60">
        {children}
      </span>
    </div>
  );
}

export function SectionLabelCentered({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="h-px w-10 bg-primary" />
      <span className="text-xs font-medium uppercase tracking-[0.25em] text-foreground/60">
        {children}
      </span>
      <span className="h-px w-10 bg-primary" />
    </div>
  );
}

export const inputClassName =
  "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-foreground/35 focus:border-primary";

export const textareaClassName =
  "w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/35 focus:border-primary";

export const labelClassName =
  "text-[11px] font-medium uppercase tracking-widest text-foreground/55";
