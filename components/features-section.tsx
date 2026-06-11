// Features section — six feature cards with stroke line icons.
// Desktop (lg+): bento grid — feature 1 spans two columns (the lead feature),
// the rest fill the remaining cells. Hierarchy through scale, not color.
// Mobile/tablet: a plain vertical stack — every feature scannable in one scroll,
// no carousels, no swipe choreography.
import { Animate } from "@/components/animate";
import { RevealGroup } from "@/components/reveal-group";
import { SectionHeader } from "@/components/section-header";
import { Card } from "@/components/card";
import { Inbox, Calendar, Globe, Link2, RefreshCw, LayoutDashboard } from "lucide-react";

interface FeaturesSectionProps {
  label: string;
  headline: string;
  feature1Title: string;
  feature1Excerpt: string;
  feature2Title: string;
  feature2Excerpt: string;
  feature3Title: string;
  feature3Excerpt: string;
  feature4Title: string;
  feature4Excerpt: string;
  feature5Title: string;
  feature5Excerpt: string;
  feature6Title: string;
  feature6Excerpt: string;
}

// Brand icon treatment: stroke-based, 1.5px, currentColor (gold via Card).
const ICON_PROPS = { strokeWidth: 1.5, className: "h-6 w-6" } as const;

export function FeaturesSection({
  label,
  headline,
  feature1Title,
  feature1Excerpt,
  feature2Title,
  feature2Excerpt,
  feature3Title,
  feature3Excerpt,
  feature4Title,
  feature4Excerpt,
  feature5Title,
  feature5Excerpt,
  feature6Title,
  feature6Excerpt,
}: FeaturesSectionProps) {
  const features = [
    { title: feature1Title, excerpt: feature1Excerpt, icon: <Inbox {...ICON_PROPS} /> },
    { title: feature2Title, excerpt: feature2Excerpt, icon: <Calendar {...ICON_PROPS} /> },
    { title: feature3Title, excerpt: feature3Excerpt, icon: <Globe {...ICON_PROPS} /> },
    { title: feature4Title, excerpt: feature4Excerpt, icon: <Link2 {...ICON_PROPS} /> },
    { title: feature5Title, excerpt: feature5Excerpt, icon: <RefreshCw {...ICON_PROPS} /> },
    { title: feature6Title, excerpt: feature6Excerpt, icon: <LayoutDashboard {...ICON_PROPS} /> },
  ];

  return (
    <div>
      {/* Section header */}
      <Animate type="fade-up" className="mb-block">
        <SectionHeader label={label} headline={headline} />
      </Animate>

      {/* One reveal group, two layouts: vertical stack < lg, bento grid >= lg.
          4-col bento, two rows: features 1 and 6 span two columns (top-left and
          bottom-right anchors) — hierarchy through scale, no holes in the grid. */}
      <RevealGroup type="fade-up" className="gap-group grid grid-cols-1 lg:grid-cols-4">
        {features.map(({ title, excerpt, icon }, i) => (
          <Card
            key={title}
            title={title}
            excerpt={excerpt}
            icon={icon}
            className={i === 0 || i === 5 ? "lg:col-span-2" : undefined}
          />
        ))}
      </RevealGroup>
    </div>
  );
}
