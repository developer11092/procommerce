"use client";

import { useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

// Magnetic button — cursor-following micro-interaction (Framer Motion springs).
// The pull is clamped to a small radius so the button never travels out from
// under the cursor (which used to cause an enter/leave flicker on hover).
export default function MagBtn({ className, onClick, children, strength = 0.18, max = 8 }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 22, mass: 0.5 });
  const y = useSpring(my, { stiffness: 200, damping: 22, mass: 0.5 });
  const clamp = (v) => Math.max(-max, Math.min(max, v));
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(clamp((e.clientX - r.left - r.width / 2) * strength));
    my.set(clamp((e.clientY - r.top - r.height / 2) * strength));
  };
  const reset = () => { mx.set(0); my.set(0); };
  return (
    <motion.button
      ref={ref}
      type="button"
      className={className}
      onClick={onClick}
      onPointerMove={(e) => { if (e.pointerType === "mouse") onMove(e); }}
      onPointerLeave={reset}
      onPointerUp={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
