const rnd = (): bigint => (BigInt(Math.floor(Math.random() * 2 ** 32)) << 32n) | BigInt(Math.floor(Math.random() * 2 ** 32));
/** Random signed 64-bit seed, as a decimal string (Minecraft's seed format). */
export const randomSeed = (): string => BigInt.asIntN(64, rnd()).toString();
