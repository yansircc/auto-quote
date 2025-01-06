"use client";

import dynamic from "next/dynamic";
import type { CuboidLayout } from "@/lib/quote-price/mold/layout/types";

// Dynamic import of the actual viewer component
const DynamicLayoutViewer = dynamic(
  () => import("./layout-viewer-core").then((mod) => mod.LayoutViewerCore),
  {
    ssr: false,
    loading: () => <div className="h-[500px] w-full animate-pulse bg-muted" />,
  },
);

interface LayoutViewerProps {
  layout: CuboidLayout[];
  moldDimensions: {
    width: number;
    depth: number;
    height: number;
  };
  className?: string;
}

export function LayoutViewer(props: LayoutViewerProps) {
  return <DynamicLayoutViewer {...props} />;
}
