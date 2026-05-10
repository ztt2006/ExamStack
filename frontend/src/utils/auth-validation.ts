export interface AuthFieldErrors {
  account?: string;
  username?: string;
  email?: string;
  school?: string;
  password?: string;
}

export interface LoginFormValues {
  account: string;
  password: string;
}

export interface RegisterFormValues {
  username: string;
  email: string;
  school: string;
  password: string;
}

export interface ProfileFormValues {
  username: string;
  email: string;
  school: string;
}

function isBlank(value: string) {
  return value.trim().length === 0;
}

export function validateAccount(account: string) {
  const value = account.trim();
  if (!value) {
    return "请输入用户名或邮箱。";
  }
  if (value.length < 3) {
    return "用户名或邮箱至少需要 3 个字符。";
  }
  if (value.length > 100) {
    return "用户名或邮箱不能超过 100 个字符。";
  }
  return "";
}

export function validateUsername(username: string) {
  const value = username.trim();
  if (!value) {
    return "请输入用户名。";
  }
  if (value.length < 3) {
    return "用户名至少需要 3 个字符。";
  }
  if (value.length > 50) {
    return "用户名不能超过 50 个字符。";
  }
  if (!/^[A-Za-z0-9_\-\u4e00-\u9fa5]+$/.test(value)) {
    return "用户名只能包含中文、字母、数字、下划线或短横线。";
  }
  return "";
}

export function validateEmail(email: string) {
  const value = email.trim();
  if (!value) {
    return "请输入邮箱。";
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    return "请输入有效的邮箱地址。";
  }
  return "";
}

export function validateSchool(school: string) {
  const value = school.trim();
  if (!value) {
    return "请输入学校名称。";
  }
  if (value.length < 2) {
    return "学校名称至少需要 2 个字符。";
  }
  if (value.length > 120) {
    return "学校名称不能超过 120 个字符。";
  }
  return "";
}

export function validatePassword(password: string) {
  if (!password) {
    return "请输入密码。";
  }
  if (password.length < 8) {
    return "密码至少需要 8 个字符。";
  }
  if (password.length > 64) {
    return "密码不能超过 64 个字符。";
  }
  return "";
}

export function validateLoginForm(values: LoginFormValues): AuthFieldErrors {
  return {
    account: validateAccount(values.account),
    password: validatePassword(values.password),
  };
}

export function validateRegisterForm(values: RegisterFormValues): AuthFieldErrors {
  return {
    username: validateUsername(values.username),
    email: validateEmail(values.email),
    school: validateSchool(values.school),
    password: validatePassword(values.password),
  };
}

export function validateProfileForm(values: ProfileFormValues): AuthFieldErrors {
  return {
    username: validateUsername(values.username),
    email: validateEmail(values.email),
    school: validateSchool(values.school),
  };
}

export function hasAuthErrors(errors: AuthFieldErrors) {
  return Object.values(errors).some((value) => !isBlank(value ?? ""));
}
