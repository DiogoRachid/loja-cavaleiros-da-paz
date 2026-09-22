import { motion, useReducedMotion } from "framer-motion";

export default function MasonicBackdrop() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_48%,hsl(var(--landing-bright)/0.7),transparent_50%),linear-gradient(130deg,hsl(var(--landing-deep)),hsl(var(--landing-surface)))]" />
      <motion.div animate={reduced ? undefined : { opacity: [0.2, 0.5, 0.2], scale: [1, 1.06, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-40 top-10 h-[50rem] w-[50rem] rounded-full border border-lodge-gold/20" />
      <div className="absolute left-[5%] top-0 hidden h-full w-16 border-x border-lodge-gold/15 lg:block"><div className="absolute inset-x-[-12px] top-28 h-3 border-y border-lodge-gold/25" /></div>
      <div className="absolute right-[5%] top-0 hidden h-full w-16 border-x border-lodge-gold/15 lg:block"><div className="absolute inset-x-[-12px] top-28 h-3 border-y border-lodge-gold/25" /></div>
      <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(45deg,hsl(var(--lodge-gold)/0.07)_25%,transparent_25%,transparent_75%,hsl(var(--lodge-gold)/0.07)_75%),linear-gradient(45deg,hsl(var(--lodge-gold)/0.07)_25%,transparent_25%,transparent_75%,hsl(var(--lodge-gold)/0.07)_75%)] [background-position:0_0,24px_24px] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
    </div>
  );
}