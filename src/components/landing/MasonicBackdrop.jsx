export default function MasonicBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-lodge-gold">
      <div className="absolute left-1/2 top-10 h-[43rem] w-[min(72rem,90vw)] -translate-x-1/2 rounded-t-[50%] border border-lodge-gold/20" />
      <div className="absolute left-1/2 top-16 h-[40rem] w-[min(68rem,85vw)] -translate-x-1/2 rounded-t-[50%] border border-lodge-gold/10" />
      <div className="absolute inset-y-0 left-[7%] hidden w-20 border-x border-lodge-gold/20 lg:block"><div className="absolute inset-y-0 left-3 border-l border-lodge-gold/10" /><div className="absolute inset-y-0 right-3 border-r border-lodge-gold/10" /><div className="absolute inset-x-[-12px] top-28 h-4 border-y border-lodge-gold/30" /></div>
      <div className="absolute inset-y-0 right-[7%] hidden w-20 border-x border-lodge-gold/20 lg:block"><div className="absolute inset-y-0 left-3 border-l border-lodge-gold/10" /><div className="absolute inset-y-0 right-3 border-r border-lodge-gold/10" /><div className="absolute inset-x-[-12px] top-28 h-4 border-y border-lodge-gold/30" /></div>
      <div className="absolute inset-x-0 bottom-0 h-32 border-t border-lodge-gold/10 bg-[linear-gradient(45deg,hsl(var(--lodge-gold)/0.05)_25%,transparent_25%,transparent_75%,hsl(var(--lodge-gold)/0.05)_75%),linear-gradient(45deg,hsl(var(--lodge-gold)/0.05)_25%,transparent_25%,transparent_75%,hsl(var(--lodge-gold)/0.05)_75%)] [background-position:0_0,24px_24px] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,hsl(var(--lodge-gold)/0.10),transparent_55%)]" />
    </div>
  );
}