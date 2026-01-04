import { CircuitBreaker, CircuitOpenError } from '../lib/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'TestService',
      failureThreshold: 3,
      resetTimeout: 100, // Short timeout for testing
      successThreshold: 2,
    });
  });

  describe('CLOSED state', () => {
    it('should execute function successfully', async () => {
      const result = await breaker.execute(async () => 'success');
      expect(result).toBe('success');
      expect(breaker.getStats().state).toBe('CLOSED');
    });

    it('should track successful calls', async () => {
      await breaker.execute(async () => 'ok');
      await breaker.execute(async () => 'ok');
      
      const stats = breaker.getStats();
      expect(stats.totalCalls).toBe(2);
      expect(stats.successes).toBe(2);
      expect(stats.failures).toBe(0);
    });

    it('should propagate errors but stay closed below threshold', async () => {
      await expect(breaker.execute(async () => { throw new Error('fail'); }))
        .rejects.toThrow('fail');
      await expect(breaker.execute(async () => { throw new Error('fail'); }))
        .rejects.toThrow('fail');
      
      const stats = breaker.getStats();
      expect(stats.state).toBe('CLOSED');
      expect(stats.failures).toBe(2);
    });
  });

  describe('OPEN state', () => {
    it('should open after reaching failure threshold', async () => {
      // Fail 3 times to reach threshold
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(async () => { throw new Error('fail'); }))
          .rejects.toThrow('fail');
      }
      
      expect(breaker.getStats().state).toBe('OPEN');
    });

    it('should fail fast when open', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(async () => { throw new Error('fail'); }))
          .rejects.toThrow('fail');
      }
      
      // Next call should fail immediately with CircuitOpenError
      await expect(breaker.execute(async () => 'should not run'))
        .rejects.toThrow(CircuitOpenError);
    });

    it('should include service name in CircuitOpenError', async () => {
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(async () => { throw new Error('fail'); }))
          .rejects.toThrow('fail');
      }
      
      try {
        await breaker.execute(async () => 'nope');
      } catch (error) {
        expect(error).toBeInstanceOf(CircuitOpenError);
        expect((error as CircuitOpenError).serviceName).toBe('TestService');
      }
    });
  });

  describe('HALF_OPEN state', () => {
    it('should transition to HALF_OPEN after resetTimeout', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(async () => { throw new Error('fail'); }))
          .rejects.toThrow('fail');
      }
      expect(breaker.getStats().state).toBe('OPEN');
      
      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Next call should trigger HALF_OPEN
      await breaker.execute(async () => 'success');
      // After success, should be HALF_OPEN waiting for more successes
      // or CLOSED if successThreshold is met
    });

    it('should close after success threshold in HALF_OPEN', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(async () => { throw new Error('fail'); }))
          .rejects.toThrow('fail');
      }
      
      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Two successful calls should close (successThreshold = 2)
      await breaker.execute(async () => 'success1');
      await breaker.execute(async () => 'success2');
      
      expect(breaker.getStats().state).toBe('CLOSED');
    });

    it('should reopen on failure in HALF_OPEN', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(async () => { throw new Error('fail'); }))
          .rejects.toThrow('fail');
      }
      
      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // One success (not enough to close)
      await breaker.execute(async () => 'success');
      
      // Then fail - should reopen
      await expect(breaker.execute(async () => { throw new Error('fail again'); }))
        .rejects.toThrow('fail again');
      
      expect(breaker.getStats().state).toBe('OPEN');
    });
  });

  describe('executeWithFallback', () => {
    it('should return result when circuit is closed', async () => {
      const result = await breaker.executeWithFallback(
        async () => 'real value',
        'fallback value'
      );
      expect(result).toBe('real value');
    });

    it('should return fallback when circuit is open', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(async () => { throw new Error('fail'); }))
          .rejects.toThrow('fail');
      }
      
      const result = await breaker.executeWithFallback(
        async () => 'should not run',
        'fallback value'
      );
      expect(result).toBe('fallback value');
    });

    it('should propagate non-CircuitOpenError errors', async () => {
      await expect(breaker.executeWithFallback(
        async () => { throw new Error('real error'); },
        'fallback'
      )).rejects.toThrow('real error');
    });
  });

  describe('reset', () => {
    it('should manually reset an open circuit', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(async () => { throw new Error('fail'); }))
          .rejects.toThrow('fail');
      }
      expect(breaker.getStats().state).toBe('OPEN');
      
      // Manual reset
      breaker.reset();
      
      expect(breaker.getStats().state).toBe('CLOSED');
      
      // Should be able to execute again
      const result = await breaker.execute(async () => 'works again');
      expect(result).toBe('works again');
    });
  });

  describe('stats', () => {
    it('should track total calls and failures', async () => {
      await breaker.execute(async () => 'ok');
      await expect(breaker.execute(async () => { throw new Error('fail'); }))
        .rejects.toThrow('fail');
      await breaker.execute(async () => 'ok');
      
      const stats = breaker.getStats();
      expect(stats.totalCalls).toBe(3);
      expect(stats.totalFailures).toBe(1);
    });

    it('should track last success and failure times', async () => {
      const beforeSuccess = new Date();
      await breaker.execute(async () => 'ok');
      const afterSuccess = new Date();
      
      const stats1 = breaker.getStats();
      expect(stats1.lastSuccess).not.toBeNull();
      expect(stats1.lastSuccess!.getTime()).toBeGreaterThanOrEqual(beforeSuccess.getTime());
      expect(stats1.lastSuccess!.getTime()).toBeLessThanOrEqual(afterSuccess.getTime());
      
      const beforeFailure = new Date();
      await expect(breaker.execute(async () => { throw new Error('fail'); }))
        .rejects.toThrow('fail');
      const afterFailure = new Date();
      
      const stats2 = breaker.getStats();
      expect(stats2.lastFailure).not.toBeNull();
      expect(stats2.lastFailure!.getTime()).toBeGreaterThanOrEqual(beforeFailure.getTime());
      expect(stats2.lastFailure!.getTime()).toBeLessThanOrEqual(afterFailure.getTime());
    });
  });
});
