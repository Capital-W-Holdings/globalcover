/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascade failures when third-party services are down.
 * States: CLOSED (normal) -> OPEN (failing) -> HALF_OPEN (testing)
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Name of the service (for logging) */
  name: string;
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting to close circuit */
  resetTimeout: number;
  /** Number of successful calls needed in HALF_OPEN to close */
  successThreshold: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  totalCalls: number;
  totalFailures: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailure: Date | null = null;
  private lastSuccess: Date | null = null;
  private totalCalls = 0;
  private totalFailures = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
    };
  }

  private shouldAttemptReset(): boolean {
    if (this.state !== 'OPEN' || !this.lastFailure) {
      return false;
    }
    const timeSinceLastFailure = Date.now() - this.lastFailure.getTime();
    return timeSinceLastFailure >= this.config.resetTimeout;
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state !== newState) {
      console.log(`[CircuitBreaker:${this.config.name}] ${this.state} -> ${newState}`);
      this.state = newState;
      
      if (newState === 'HALF_OPEN') {
        this.successes = 0;
      }
    }
  }

  private recordSuccess(): void {
    this.lastSuccess = new Date();
    this.successes++;
    this.failures = 0;

    if (this.state === 'HALF_OPEN' && this.successes >= this.config.successThreshold) {
      this.transitionTo('CLOSED');
    }
  }

  private recordFailure(): void {
    this.lastFailure = new Date();
    this.failures++;
    this.totalFailures++;
    this.successes = 0;

    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN');
    } else if (this.state === 'CLOSED' && this.failures >= this.config.failureThreshold) {
      this.transitionTo('OPEN');
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    // Check if we should attempt to reset
    if (this.shouldAttemptReset()) {
      this.transitionTo('HALF_OPEN');
    }

    // If circuit is open, fail fast
    if (this.state === 'OPEN') {
      throw new CircuitOpenError(this.config.name, this.config.resetTimeout);
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Execute with fallback value when circuit is open
   */
  async executeWithFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await this.execute(fn);
    } catch (error) {
      if (error instanceof CircuitOpenError) {
        console.log(`[CircuitBreaker:${this.config.name}] Using fallback value`);
        return fallback;
      }
      throw error;
    }
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    console.log(`[CircuitBreaker:${this.config.name}] Manually reset`);
  }
}

export class CircuitOpenError extends Error {
  constructor(
    public readonly serviceName: string,
    public readonly resetTimeout: number
  ) {
    super(`Circuit breaker for ${serviceName} is OPEN. Retry after ${resetTimeout}ms`);
    this.name = 'CircuitOpenError';
  }
}

// Pre-configured circuit breakers for common services
export const circuitBreakers = {
  stripe: new CircuitBreaker({
    name: 'Stripe',
    failureThreshold: 5,
    resetTimeout: 30000, // 30 seconds
    successThreshold: 2,
  }),
  sendgrid: new CircuitBreaker({
    name: 'SendGrid',
    failureThreshold: 3,
    resetTimeout: 60000, // 1 minute
    successThreshold: 1,
  }),
  segment: new CircuitBreaker({
    name: 'Segment',
    failureThreshold: 5,
    resetTimeout: 30000,
    successThreshold: 1,
  }),
};

/**
 * Get all circuit breaker stats for monitoring
 */
export function getAllCircuitStats(): Record<string, CircuitBreakerStats> {
  return {
    stripe: circuitBreakers.stripe.getStats(),
    sendgrid: circuitBreakers.sendgrid.getStats(),
    segment: circuitBreakers.segment.getStats(),
  };
}
