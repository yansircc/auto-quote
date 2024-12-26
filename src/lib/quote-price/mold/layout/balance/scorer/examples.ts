import type { BaseCuboid } from "../types";
import { aspectRatioScorer } from "./aspect-ratio";
import { distanceDistributionScorer } from "./distance-distribution";

const mockCuboids: BaseCuboid[] = [
  {
    width: 120, // x
    depth: 130, // y
    height: 100, // z
  },
  {
    width: 120, // x
    depth: 130, // y
    height: 100, // z
  },
  {
    width: 120, // x
    depth: 130, // y
    height: 100, // z
  },
  {
    width: 120, // x
    depth: 130, // y
    height: 100, // z
  },
];

const aspectRatioScore = aspectRatioScorer(mockCuboids).toFixed(2);
const distanceDistributionScore =
  distanceDistributionScorer(mockCuboids).toFixed(2);

console.log(aspectRatioScore);
console.log(distanceDistributionScore);
// bun run src/lib/quote-price/mold/layout/balance/scorer/examples.ts
