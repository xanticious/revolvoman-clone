/**
 * A seeded pseudorandom number generator using a linear congruential generator (LCG)
 * Based on the Lehmer random number generator
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      // Convert base64 string to number
      this.seed = this.base64ToNumber(seed);
    } else {
      this.seed = seed;
    }
    // Ensure seed is positive and within safe integer range
    this.seed = Math.abs(this.seed % 2147483647);
    if (this.seed <= 1) this.seed += 1;
  }

  /**
   * Generate next random value between 0 and 1 (exclusive)
   */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /**
   * Generate random integer in range [low, high] (inclusive)
   */
  integer(low: number, high: number): number {
    return Math.floor(this.next() * (high - low + 1)) + low;
  }

  /**
   * Generate random float with gaussian distribution
   */
  gaussianFloat(center: number, standardDeviation: number): number {
    // Box-Muller transform
    let u = 0,
      v = 0;
    while (u === 0) u = this.next(); // Converting [0,1) to (0,1)
    while (v === 0) v = this.next();

    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * standardDeviation + center;
  }

  /**
   * Generate random integer with gaussian distribution
   */
  gaussianInteger(center: number, standardDeviation: number): number {
    return Math.round(this.gaussianFloat(center, standardDeviation));
  }

  /**
   * Select value from weighted probability table
   */
  weightedDiscrete<T>(
    probabilityTable: Array<{ value: T; probability: number }>
  ): T {
    const totalWeight = probabilityTable.reduce(
      (sum, item) => sum + item.probability,
      0
    );
    let random = this.next() * totalWeight;

    for (const item of probabilityTable) {
      random -= item.probability;
      if (random <= 0) {
        return item.value;
      }
    }

    // Fallback to last item if we somehow didn't select anything
    return probabilityTable[probabilityTable.length - 1].value;
  }

  /**
   * Generate random base64 string of specified length
   */
  base64(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[this.integer(0, chars.length - 1)];
    }
    return result;
  }

  /**
   * Convert base64 string to number for seeding
   */
  private base64ToNumber(base64: string): number {
    let hash = 0;
    for (let i = 0; i < base64.length; i++) {
      const char = base64.charCodeAt(i);
      hash = ((hash << 5) - hash + char) & 0x7fffffff; // Keep within 32-bit signed int range
    }
    return hash;
  }

  /**
   * Generate a random seed as base64 string
   */
  static generateRandomSeed(length: number = 16): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}
