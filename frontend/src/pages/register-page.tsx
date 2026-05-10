import { Alert, PasswordInput, TextInput } from "@mantine/core";
import { useRequest } from "ahooks";
import { AlertCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { getCurrentUserWithToken, login, register } from "@/api/auth";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  hasAuthErrors,
  validateEmail,
  validatePassword,
  validateRegisterForm,
  validateSchool,
  validateUsername,
} from "@/utils/auth-validation";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    school?: string;
    password?: string;
  }>({});
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const registerRequest = useRequest(
    async () => {
      setErrorMessage("");
      const nextErrors = validateRegisterForm({ username, email, school, password });
      setFieldErrors(nextErrors);
      if (hasAuthErrors(nextErrors)) {
        return;
      }
      await register({ username, email, school, password });
      const token = await login({ account: email, password });
      const user = await getCurrentUserWithToken(token.access_token);
      setSession(token.access_token, user);
      await navigate("/", { replace: true });
    },
    {
      manual: true,
    },
  );

  return (
    <div className="grid min-h-[78dvh] items-center gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="panel-card order-2 p-6 sm:p-8 xl:order-1">
        <div className="section-badge">Register</div>
        <h1 className="section-title mt-3">
          创建新的平台账号
        </h1>
        <p className="page-copy mt-3">
          注册后即可进入极简文档台，开始上传和管理自己的文件。
        </p>

        <form
          className="mt-7 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void registerRequest.run();
          }}
        >
          <TextInput
            label="用户名"
            value={username}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setUsername(nextValue);
              if (fieldErrors.username) {
                setFieldErrors((current) => ({
                  ...current,
                  username: validateUsername(nextValue),
                }));
              }
            }}
            onBlur={() =>
              setFieldErrors((current) => ({
                ...current,
                username: validateUsername(username),
              }))
            }
            radius="xl"
            error={fieldErrors.username}
            description="3-50 个字符，可使用中文、字母、数字、下划线或短横线。"
            required
          />
          <TextInput
            label="邮箱"
            type="email"
            value={email}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setEmail(nextValue);
              if (fieldErrors.email) {
                setFieldErrors((current) => ({
                  ...current,
                  email: validateEmail(nextValue),
                }));
              }
            }}
            onBlur={() =>
              setFieldErrors((current) => ({
                ...current,
                email: validateEmail(email),
              }))
            }
            radius="xl"
            error={fieldErrors.email}
            required
          />
          <TextInput
            label="学校"
            value={school}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setSchool(nextValue);
              if (fieldErrors.school) {
                setFieldErrors((current) => ({
                  ...current,
                  school: validateSchool(nextValue),
                }));
              }
            }}
            onBlur={() =>
              setFieldErrors((current) => ({
                ...current,
                school: validateSchool(school),
              }))
            }
            radius="xl"
            error={fieldErrors.school}
            required
          />
          <PasswordInput
            label="密码"
            value={password}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setPassword(nextValue);
              if (fieldErrors.password) {
                setFieldErrors((current) => ({
                  ...current,
                  password: validatePassword(nextValue),
                }));
              }
            }}
            onBlur={() =>
              setFieldErrors((current) => ({
                ...current,
                password: validatePassword(password),
              }))
            }
            radius="xl"
            error={fieldErrors.password}
            description="至少 8 位。"
            required
          />

          {errorMessage ? (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="xl"
              title="注册失败"
            >
              {errorMessage}
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="admin-primary-btn w-full justify-center"
            disabled={registerRequest.loading}
          >
            <UserPlus />
            {registerRequest.loading ? "正在创建账号..." : "注册并进入社区"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-ink-soft)]">
          已经有账号？
          <Link to="/login" className="ml-2 font-semibold text-[var(--color-sky-strong)]">
            去登录
          </Link>
        </p>
      </section>

      <section className="panel-card hero-panel order-1 min-h-[560px] p-8 xl:order-2">
        <div className="flex h-full flex-col justify-between">
          <BrandMark />
          <div>
            <div className="section-badge">New Account</div>
            <h2 className="page-title mt-4 max-w-[11ch]">
              注册后立刻开始管理你的文档
            </h2>
            <p className="page-copy mt-5 max-w-[46ch]">
              平台只保留最核心的文档工作流，让录入和检索都尽量直接，不再需要额外业务字段。
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="metric-card">
              <p className="metric-value">2</p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">主导航</p>
            </div>
            <div className="metric-card">
              <p className="metric-value">1</p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">资料表格</p>
            </div>
            <div className="metric-card">
              <p className="metric-value">2</p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">上传字段</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
