"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toFaDigits } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AnimatedCounter({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: value,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => {
          el.textContent = toFaDigits(Math.floor(obj.val)) + suffix;
        },
      });
    });
    return () => ctx.revert();
  }, [value, suffix]);

  return (
    <div className="text-center">
      <span ref={ref} className="block text-4xl font-black text-ink md:text-5xl">
        ۰{suffix}
      </span>
      <span className="mt-2 block text-sm font-bold text-ink/60">{label}</span>
    </div>
  );
}
