import { motion, useScroll, useSpring } from "framer-motion";

// Barra fina de progresso de leitura no topo da landing page
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-[#C9A227] to-[#F5E6B3]"
    />
  );
}