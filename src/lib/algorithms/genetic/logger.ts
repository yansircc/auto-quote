/**
 * 遗传算法日志记录器
 */
export class GeneticLogger<T extends Record<string, number>> {
  constructor(
    private options: {
      formatValue?: (value: number) => string;
      formatIndividual?: (individual: T) => string;
      testCaseFormatter?: (individual: T) => string;
    } = {},
  ) {
    this.options.formatValue =
      options.formatValue ?? ((v: number) => v.toFixed(4));
  }

  logGeneration(
    generation: number,
    bestFitness: number,
    avgFitness: number,
    diversity: number,
  ): void {
    const format = this.options.formatValue!;
    console.log(
      `Generation ${generation}: ` +
        `Best = ${format(bestFitness)}, ` +
        `Avg = ${format(avgFitness)}, ` +
        `Diversity = ${format(diversity)}`,
    );
  }

  logNewBest(individual: T, fitness: number): void {
    const format = this.options.formatValue!;
    if (this.options.formatIndividual) {
      console.log(
        "New best solution found:",
        this.options.formatIndividual(individual),
        `\nFitness: ${format(fitness)}`,
      );
    } else {
      console.log(
        "New best solution found:",
        // `\nParameters: ${JSON.stringify(individual, null, 2)}`,
        `\nFitness: ${format(fitness)}`,
      );
    }

    // 如果提供了测试用例格式化器，则输出测试用例结果
    // if (this.options.testCaseFormatter) {
    //   console.log("\nTest case results:");
    //   console.log(this.options.testCaseFormatter(individual));
    // }
  }
}
