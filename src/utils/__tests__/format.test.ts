import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, truncateText, pluralize } from '../format';

describe('formatCurrency', () => {
  it('should format BYN currency by default', () => {
    const result = formatCurrency(1500);
    expect(result).toBeTruthy();
    expect(result).toContain('1');
  });

  it('should format USD currency', () => {
    const result = formatCurrency(99.5, 'USD', 'en-US');
    expect(result).toContain('$');
    expect(result).toContain('99');
  });

  it('should handle zero', () => {
    const result = formatCurrency(0, 'USD', 'en-US');
    expect(result).toContain('$');
    expect(result).toContain('0');
  });
});

describe('formatNumber', () => {
  it('should format number with separators', () => {
    const result = formatNumber(1234567);
    expect(result).toBeTruthy();
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('truncateText', () => {
  it('should not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('should truncate long text with ellipsis', () => {
    const result = truncateText('This is a very long text that should be truncated', 20);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
  });

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });

  it('should handle exact length', () => {
    expect(truncateText('12345', 5)).toBe('12345');
  });
});

describe('pluralize', () => {
  it('should return singular form for 1', () => {
    expect(pluralize(1, 'проект', 'проекта', 'проектов')).toBe('проект');
  });

  it('should return few form for 2-4', () => {
    expect(pluralize(2, 'проект', 'проекта', 'проектов')).toBe('проекта');
    expect(pluralize(3, 'проект', 'проекта', 'проектов')).toBe('проекта');
    expect(pluralize(4, 'проект', 'проекта', 'проектов')).toBe('проекта');
  });

  it('should return many form for 5-20', () => {
    expect(pluralize(5, 'проект', 'проекта', 'проектов')).toBe('проектов');
    expect(pluralize(11, 'проект', 'проекта', 'проектов')).toBe('проектов');
    expect(pluralize(15, 'проект', 'проекта', 'проектов')).toBe('проектов');
    expect(pluralize(20, 'проект', 'проекта', 'проектов')).toBe('проектов');
  });

  it('should handle 21 (singular)', () => {
    expect(pluralize(21, 'проект', 'проекта', 'проектов')).toBe('проект');
  });

  it('should handle 22-24 (few)', () => {
    expect(pluralize(22, 'проект', 'проекта', 'проектов')).toBe('проекта');
  });

  it('should handle 100', () => {
    expect(pluralize(100, 'проект', 'проекта', 'проектов')).toBe('проектов');
  });
});
