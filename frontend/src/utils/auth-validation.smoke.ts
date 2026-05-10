import {
  hasAuthErrors,
  validateLoginForm,
  validateRegisterForm,
} from "./auth-validation";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const invalidLogin = validateLoginForm({
  account: "ab",
  password: "1234567",
});
assert(invalidLogin.account === "用户名或邮箱至少需要 3 个字符。", "login account validation failed");
assert(invalidLogin.password === "密码至少需要 8 个字符。", "login password validation failed");
assert(hasAuthErrors(invalidLogin), "login errors should be detected");

const invalidRegister = validateRegisterForm({
  username: "a!",
  email: "bad-email",
  school: "a",
  password: "password",
});
assert(invalidRegister.username === "用户名只能包含中文、字母、数字、下划线或短横线。", "username rule failed");
assert(invalidRegister.email === "请输入有效的邮箱地址。", "email rule failed");
assert(invalidRegister.school === "学校名称至少需要 2 个字符。", "school rule failed");
assert(invalidRegister.password === "密码需同时包含字母和数字。", "password composition rule failed");
assert(hasAuthErrors(invalidRegister), "register errors should be detected");

const validRegister = validateRegisterForm({
  username: "exam_user",
  email: "user@example.com",
  school: "Test University",
  password: "Password123",
});
assert(!hasAuthErrors(validRegister), "valid register data should pass");
