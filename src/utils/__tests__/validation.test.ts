import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, emailSchema, passwordSchema } from '../validation';

describe('emailSchema', () => {
  it('should accept valid email', () => {
    const result = emailSchema.safeParse('user@example.com');
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = emailSchema.safeParse('not-an-email');
    expect(result.success).toBe(false);
  });

  it('should reject empty string', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('should accept valid password', () => {
    const result = passwordSchema.safeParse('SecurePass1');
    expect(result.success).toBe(true);
  });

  it('should reject short password', () => {
    const result = passwordSchema.safeParse('Sh1');
    expect(result.success).toBe(false);
  });

  it('should reject password without uppercase', () => {
    const result = passwordSchema.safeParse('lowercase1');
    expect(result.success).toBe(false);
  });

  it('should reject password without lowercase', () => {
    const result = passwordSchema.safeParse('UPPERCASE1');
    expect(result.success).toBe(false);
  });

  it('should reject password without number', () => {
    const result = passwordSchema.safeParse('NoNumberHere');
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'Password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'SecurePass1',
      confirmPassword: 'SecurePass1',
      name: 'Иван',
      role: 'freelancer',
      agreeToTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'SecurePass1',
      confirmPassword: 'DifferentPass2',
      name: 'Иван',
      role: 'freelancer',
      agreeToTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('should reject without accepting terms', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'SecurePass1',
      confirmPassword: 'SecurePass1',
      name: 'Иван',
      role: 'freelancer',
      agreeToTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid role', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'SecurePass1',
      confirmPassword: 'SecurePass1',
      name: 'Иван',
      role: 'invalid_role',
      agreeToTerms: true,
    });
    expect(result.success).toBe(false);
  });
});
