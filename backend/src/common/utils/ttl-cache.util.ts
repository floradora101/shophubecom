/**
 * Simple in-memory TTL cache.
 * Use for data that changes infrequently (e.g. promotions, category trees).
 */
export class TtlCache<K, V> {
  private readonly cache = new Map<
    K,
    { value: V; expiresAt: number }
  >();
  private readonly ttlMs: number;

  constructor(ttlSeconds: number) {
    this.ttlMs = ttlSeconds * 1000;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}
