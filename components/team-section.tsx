"use client";

// Team teaser — circular spinning-ring avatars, motion/react stagger on scroll entry.
// Ring animation: CSS keyframe in globals.css. Counter-spin keeps photo upright.
// 5-member layout: grid-cols-2 md:grid-cols-5. Last card (when count is odd) gets
// col-span-2 + constrained width so it centers on mobile like 2+2+1 symmetry.

import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/scroll-reveal";

// Stagger container: children animate in sequence
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
};

interface TeamSectionProps {
  label: string;
  headline: string;
  name1: string; role1: string;
  name2: string; role2: string;
  name3: string; role3: string;
  name4: string; role4: string;
  name5: string; role5: string;
  cta: string;
}

export function TeamSection({
  label, headline,
  name1, role1,
  name2, role2,
  name3, role3,
  name4, role4,
  name5, role5,
  cta,
}: TeamSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const members = [
    { name: name1, role: role1 },
    { name: name2, role: role2 },
    { name: name3, role: role3 },
    { name: name4, role: role4 },
    { name: name5, role: role5 },
  ];

  return (
    <div className="pb-32">
      {/* Section header — GSAP scroll reveal (same pattern as other sections) */}
      <ScrollReveal className="mb-12">
        <p className="text-[12px] font-normal leading-none tracking-[0.1px] uppercase text-text-tertiary mb-6">
          {label}
        </p>
        <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] text-text-primary">
          {headline}
        </h2>
      </ScrollReveal>

      {/* Team grid — motion/react stagger with scale entry */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10"
        variants={shouldReduceMotion ? undefined : containerVariants}
        initial={shouldReduceMotion ? undefined : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "show"}
        viewport={{ once: true, amount: 0.2 }}
      >
        {members.map(({ name, role }, i) => {
          // Last item when count is odd: span 2 cols and constrain width to match one column.
          // calc(50% - 12px) = one column width in a 2-col grid with gap-6 (24px gap / 2 = 12px).
          const isOddLast = i === members.length - 1 && members.length % 2 !== 0;

          return (
            <motion.div
              key={name}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className={isOddLast ? "col-span-2 md:col-span-1 flex md:block justify-center" : ""}
            >
              <div className={isOddLast ? "w-[calc(50%-12px)] md:w-full" : ""}>
                {/* Spinning ring — outer spins, inner counter-spins to keep photo upright */}
                <div className="team-avatar-ring mb-4">
                  <div className="team-avatar-inner aspect-square">
                    {/* Photo placeholder — replace with next/image when portrait is available */}
                    <div className="w-full h-full bg-surface-elevated" />
                  </div>
                </div>

                <p className="text-[15px] font-semibold leading-[1.3] tracking-[-0.1px] text-text-primary mb-1">
                  {name}
                </p>
                <p className="text-[13px] font-normal leading-none text-text-tertiary">
                  {role}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Link to full about page */}
      <Link
        href="/about"
        className="text-[14px] font-normal text-text-secondary underline underline-offset-4 decoration-border-subtle hover:text-text-primary hover:decoration-text-secondary transition-colors duration-150"
      >
        {cta}
      </Link>
    </div>
  );
}
