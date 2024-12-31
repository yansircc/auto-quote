"use client";

import type { ProductScheme } from "@/types/user-guide/scheme";
import { SchemeOverviewCard } from "./scheme-overview-card";
import { MoldInfoCard } from "./mold-info-card";

interface SchemeCardProps {
  scheme: ProductScheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  return (
    <div className="space-y-6">
      <SchemeOverviewCard scheme={scheme} />
      <MoldInfoCard
        material={scheme.moldMaterial}
        weight={scheme.weight}
        price={scheme.moldPrice}
        dimensions={scheme.dimensions}
      />
    </div>
  );
}
