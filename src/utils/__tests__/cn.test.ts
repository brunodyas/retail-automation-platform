import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn (classnames utility)', () => {
  it('should merge classes', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toContain('base');
    expect(result).toContain('active');
  });

  it('should handle false conditions', () => {
    const result = cn('base', false && 'hidden');
    expect(result).toBe('base');
  });

  it('should merge conflicting Tailwind classes', () => {
    // twMerge should resolve conflicts: px-4 vs px-2 → px-2
    const result = cn('px-4', 'px-2');
    expect(result).toBe('px-2');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'extra');
    expect(result).toBe('base extra');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });
});
