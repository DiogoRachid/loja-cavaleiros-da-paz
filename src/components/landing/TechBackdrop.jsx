import { motion, useReducedMotion } from "framer-motion";

export default function TechBackdrop() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,hsl(var(--lodge-gold)/0.12),transparent_45%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,hsl(var(--lodge-gold)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--lodge-gold)/0.18)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_35%,transparent)]" />
      <div className="absolute inset-0 grid place-items-center">
        <motion.div animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="relative h-[32rem] w-[32rem] max-w-[90vw] rounded-full border border-lodge-gold/20 md:h-[42rem] md:w-[42rem]">
          <div className="absolute inset-8 rounded-full border border-dashed border-lodge-gold/20" />
          <div className="absolute inset-20 rounded-full border border-lodge-gold/10" />
          <span className="absolute left-1/2 -top-1 h-2 w-2 rounded-full bg-lodge-gold shadow-[0_0_22px_hsl(var(--lodge-gold))]" />
          <span className="absolute bottom-12 right-12 h-1.5 w-1.5 rounded-full bg-lodge-gold/70" />
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-lodge-deep to-transparent" />
    </div>
  );
}