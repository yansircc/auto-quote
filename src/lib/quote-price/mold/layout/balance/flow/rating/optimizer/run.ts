import { runDistanceOptimizer } from "./distance";
import { runPositionOptimizer } from "./position";
import { runMomentumOptimizer } from "./momentum";

type OptimizerType = "distance" | "position" | "momentum" | "all";

const getOptimizerType = (index: number): OptimizerType => {
  switch (index) {
    case 0:
      return "distance";
    case 1:
      return "position";
    case 2:
      return "momentum";
    default:
      return "all";
  }
};

const run = async (index = 0, iterations = 1) => {
  const type = getOptimizerType(index);

  switch (type) {
    case "distance":
      await runDistanceOptimizer(iterations);
      break;
    case "position":
      await runPositionOptimizer(iterations);
      break;
    case "momentum":
      await runMomentumOptimizer(iterations);
      break;
    case "all":
      await runDistanceOptimizer(iterations);
      await runPositionOptimizer(iterations);
      await runMomentumOptimizer(iterations);
      break;
  }
};

await run(1, 500);
