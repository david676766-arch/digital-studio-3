"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Reveal, SectionHeading } from "./ui";

export default function Process() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <section id="process" aria-labelledby="process-title" className="section-divider relative py-[clamp(6rem,13vw,10rem)]">
      <div className="container-luxe grid gap-16 lg:grid-cols-12">
        <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <SectionHeading id="process-title" eyebrow={t.process.eyebrow} title={t.process.title} emphasis={t.process.titleEmphasis} />
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-[0.98rem] leading-relaxed text-ivory/65">{t.process.intro}</p>
          </Reveal>
        </div>

        <ol ref={listRef} className="relative lg:col-span-6 lg:col-start-7">
          <span aria-hidden className="absolute bottom-0 left-[1.4rem] top-0 w-px bg-ivory/10" />
          <motion.span
            aria-hidden
            className="absolute left-[1.4rem] top-0 w-px origin-top bg-gradient-to-b from-gold-light via-gold to-gold-deep"
            style={{ height: "100%", scaleY: reduce ? 1 : progress }}
          />
          {t.process.steps.map((step, i) => (
            <Step key={step.title} index={i} title={step.title} text={step.text} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Step({ index, title, text }: { index: number; title: string; text: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      className="group relative grid grid-cols-[2.8rem_1fr] gap-6 pb-14 last:pb-0 md:gap-10"
      initial="off"
      whileInView="on"
      viewport={{ once: true, margin: "0px 0px -30% 0px" }}
    >
      <motion.span
        className="relative z-10 grid h-[2.8rem] w-[2.8rem] place-items-center rounded-full border text-[0.72rem] tracking-[0.08em]"
        variants={{
          off: { backgroundColor: "rgba(9,9,9,1)", borderColor: "rgba(184,155,101,0.35)", color: "rgba(184,155,101,1)", scale: reduce ? 1 : 0.85 },
          on: { backgroundColor: "rgba(184,155,101,1)", borderColor: "rgba(184,155,101,1)", color: "rgba(9,9,9,1)", scale: 1 },
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        0{index + 1}
      </motion.span>
      <motion.div
        className="border-b border-ivory/10 pb-10"
        variants={{ off: { opacity: 0, x: reduce ? 0 : 24 }, on: { opacity: 1, x: 0 } }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <h3 className="display text-[clamp(2rem,3.4vw,2.9rem)] text-ivory transition-colors duration-500 group-hover:text-gold-light">{title}</h3>
        <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-ivory/60">{text}</p>
      </motion.div>
    </motion.li>
  );
}
