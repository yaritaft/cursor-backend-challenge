// breaker.factory.ts
import _CircuitBreaker from 'opossum';

export type BreakerOptions = {
  timeout?: number; // ms máx por llamada
  errorThresholdPercentage?: number; // % de fallas para abrir
  volumeThreshold?: number; // mín. reqs para evaluar
  resetTimeout?: number; // ms hasta HALF_OPEN
};

export class BreakerFactory {
  create<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    opts: BreakerOptions = {},
    fallback?: (...args: Parameters<T>) => any,
  ) {
    const breaker = new _CircuitBreaker(fn, {
      timeout: 2000,
      errorThresholdPercentage: 50,
      volumeThreshold: 10,
      resetTimeout: 50000,
      ...opts,
    });

    if (fallback) breaker.fallback(fallback);

    // (Opcional) logs/metrics
    breaker.on('open', () => console.log('⚡ breaker OPEN'));
    breaker.on('halfOpen', () => console.log('🌓 breaker HALF-OPEN'));
    breaker.on('close', () => console.log('✅ breaker CLOSED'));
    breaker.on('reject', () => console.log('🚫 reject (open)'));
    breaker.on('timeout', () => console.log('⏳ timeout'));
    breaker.on('failure', (e) => console.log('❌ failure:', e?.message));
    breaker.on('success', () => console.log('✔️ success'));

    return breaker;
  }
}
