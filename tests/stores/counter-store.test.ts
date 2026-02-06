/**
 * Tests for counter store
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useCounterStore } from '../../src/stores/counter-store';

describe('useCounterStore', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it('should start with count 0', () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('should increment', () => {
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(1);
  });

  it('should decrement', () => {
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(-1);
  });

  it('should increment multiple times', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(3);
  });

  it('should reset to 0', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    useCounterStore.getState().reset();
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('should increment by a specific amount', () => {
    useCounterStore.getState().incrementBy(5);
    expect(useCounterStore.getState().count).toBe(5);
  });

  it('should increment by negative amount', () => {
    useCounterStore.getState().incrementBy(-3);
    expect(useCounterStore.getState().count).toBe(-3);
  });
});
