/**
 * Tests for theme store
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore, getResolvedTheme } from '../../src/stores/theme-store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system' });
  });

  it('should default to system theme', () => {
    expect(useThemeStore.getState().theme).toBe('system');
  });

  it('should set theme to light', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('should set theme to dark', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('should set theme back to system', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().setTheme('system');
    expect(useThemeStore.getState().theme).toBe('system');
  });
});

describe('getResolvedTheme', () => {
  it('should return light when theme is light', () => {
    expect(getResolvedTheme('light')).toBe('light');
  });

  it('should return dark when theme is dark', () => {
    expect(getResolvedTheme('dark')).toBe('dark');
  });

  it('should resolve system theme based on media query', () => {
    // jsdom doesn't support matchMedia fully, mock it
    const mockMatchMedia = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal('matchMedia', mockMatchMedia);

    expect(getResolvedTheme('system')).toBe('dark');

    mockMatchMedia.mockReturnValue({ matches: false });
    expect(getResolvedTheme('system')).toBe('light');

    vi.unstubAllGlobals();
  });
});
