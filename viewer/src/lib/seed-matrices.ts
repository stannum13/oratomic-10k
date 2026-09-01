export const SEED_MATRICES: Record<string, { ringOrder: number; entries: number[][] }> = {
  lp16: {
    ringOrder: 45,
    entries: [
      [29, 21, 31, 15, 37, 25, 27],
      [13, 25, 19, 26, 11, 18, 29],
      [31, 2, 27, 32, 41, 41, 18],
    ],
  },
  lp20: {
    ringOrder: 75,
    entries: [
      [0, 71, 73, 68, 33, 50, 47],
      [38, 39, 60, 26, 18, 1, 23],
      [73, 6, 5, 42, 20, 22, 73],
    ],
  },
  lp24: {
    ringOrder: 91,
    entries: [
      [57, 75, 42, 80, 7, 67, 27],
      [57, 73, 34, 12, 27, 50, 87],
      [21, 53, 70, 18, 1, 3, 18],
    ],
  },
};
