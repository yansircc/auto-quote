export const machineList = [
  {
    name: "120T",
    costPerShots: 1.2,
    injection: {
      maxWeight: 153,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 360,
      maxHeight: 400,
    },
    smallBatch: {
      threshold: 1000,
      rate: 1.2,
    },
  },
  {
    name: "150T",
    costPerShots: 1.5,
    injection: {
      maxWeight: 260,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 425,
      maxHeight: 450,
    },
    smallBatch: {
      threshold: 1000,
      rate: 1.5,
    },
  },
  {
    name: "170T",
    costPerShots: 1.8,
    injection: {
      maxWeight: 300,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 470,
      maxHeight: 480,
    },
    smallBatch: {
      threshold: 1000,
      rate: 1.8,
    },
  },
  {
    name: "180T",
    costPerShots: 2,
    injection: {
      maxWeight: 350,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 500,
      maxHeight: 500,
    },
    smallBatch: {
      threshold: 1000,
      rate: 2,
    },
  },
  {
    name: "200T",
    costPerShots: 2.5,
    injection: {
      maxWeight: 450,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 530,
      maxHeight: 550,
    },
    smallBatch: {
      threshold: 1000,
      rate: 2.5,
    },
  },
  {
    name: "250T",
    costPerShots: 3,
    injection: {
      maxWeight: 600,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 580,
      maxHeight: 600,
    },
    smallBatch: {
      threshold: 1000,
      rate: 3,
    },
  },
  {
    name: "300T",
    costPerShots: 3.5,
    injection: {
      maxWeight: 800,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 635,
      maxHeight: 650,
    },
    smallBatch: {
      threshold: 1000,
      rate: 3.5,
    },
  },
  {
    name: "350T",
    costPerShots: 4,
    injection: {
      maxWeight: 1000,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 690,
      maxHeight: 700,
    },
    smallBatch: {
      threshold: 1000,
      rate: 4,
    },
  },
  {
    name: "400T",
    costPerShots: 5,
    injection: {
      maxWeight: 1377,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 700,
      maxHeight: 720,
    },
    smallBatch: {
      threshold: 1000,
      rate: 5,
    },
  },
  {
    name: "450T",
    costPerShots: 6,
    injection: {
      maxWeight: 1700,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 740,
      maxHeight: 750,
    },
    smallBatch: {
      threshold: 1000,
      rate: 6,
    },
  },
  {
    name: "500T",
    costPerShots: 7,
    injection: {
      maxWeight: 2100,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 780,
      maxHeight: 800,
    },
    smallBatch: {
      threshold: 1000,
      rate: 7,
    },
  },
  {
    name: "550T",
    costPerShots: 8,
    injection: {
      maxWeight: 2400,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 820,
      maxHeight: 900,
    },
    smallBatch: {
      threshold: 1000,
      rate: 8,
    },
  },
  {
    name: "650T",
    costPerShots: 10,
    injection: {
      maxWeight: 2446,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 930,
      maxHeight: 1000,
    },
    smallBatch: {
      threshold: 1000,
      rate: 10,
    },
  },
  {
    name: "800T",
    costPerShots: 15,
    injection: {
      maxWeight: 3468,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 1000,
      maxHeight: 1100,
    },
    smallBatch: {
      threshold: 1000,
      rate: 15,
    },
  },
  {
    name: "1100T",
    costPerShots: 20,
    injection: {
      maxWeight: 4636,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 1160,
      maxHeight: 1200,
    },
    smallBatch: {
      threshold: 1000,
      rate: 20,
    },
  },
  {
    name: "1850T",
    costPerShots: 35,
    injection: {
      maxWeight: 7339,
      safetyFactor: 0.8,
    },
    mold: {
      maxWidth: 1550,
      maxHeight: 1650,
    },
    smallBatch: {
      threshold: 1000,
      rate: 35,
    },
  },
];

/**
 * 机器配置，以下type等同于：
 * type MachineConfig = {
 *   name: string;
 *   costPerShots: number;
 *   injection: {
 *     maxWeight: number;
 *     safetyFactor: number;
 *   };
 *   mold: {
 *     maxWidth: number;
 *     maxHeight: number;
 *   };
 *   smallBatch: {
 *     threshold: number;
 *     rate: number;
 *   };
 * }
 */
export type MachineConfig = (typeof machineList)[number];
