export interface PasswordStrengthResult {
  valid: boolean;
  score: number;
  errors: string[];
}

export interface PasswordStrengthOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSymbol?: boolean;
}

const DEFAULT_OPTIONS: Required<PasswordStrengthOptions> = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: false
};

export function validatePasswordStrength(
  password: string,
  options: PasswordStrengthOptions = {}
): PasswordStrengthResult {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  let score = 0;

  if (password.length >= settings.minLength) {
    score += 1;
  } else {
    errors.push(`Password must be at least ${settings.minLength} characters long`);
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else if (settings.requireUppercase) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else if (settings.requireLowercase) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else if (settings.requireNumber) {
    errors.push("Password must contain at least one number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else if (settings.requireSymbol) {
    errors.push("Password must contain at least one symbol");
  }

  return {
    valid: errors.length === 0,
    score,
    errors
  };
}
