import { Alert, PasswordInput, TextInput } from "@mantine/core";
import { useRequest } from "ahooks";
import { AlertCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { getCurrentUserWithToken, login } from "@/api/auth";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const loginRequest = useRequest(
    async () => {
      setErrorMessage("");
      const token = await login({ account, password });
      const user = await getCurrentUserWithToken(token.access_token);
      setSession(token.access_token, user);
      const redirectTo =
        (location.state as { from?: string } | null)?.from || "/";
      await navigate(redirectTo, { replace: true });
    },
    {
      manual: true,
    },
  );

  return (
    <div className="grid min-h-[78dvh] items-center gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="panel-card hero-panel hidden h-full min-h-[560px] p-8 xl:block">
        <div className="flex h-full flex-col justify-between">
          <BrandMark />
          <div>
            <div className="section-badge">Account Access</div>
            <h1 className="page-title mt-4 max-w-[10ch]">
              回到你的极简文档台
            </h1>
            <p className="page-copy mt-5 max-w-[44ch]">
              登录后直接进入文档工作流，用最少的界面元素完成搜索、上传、预览和下载。
            </p>
          </div>
          <div className="grid gap-3">
            <div className="metric-card">
              <p className="metric-label">文档录入</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink-strong)]">只填写描述和文件</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">搜索方式</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink-strong)]">按描述或文件名检索</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">页面结构</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink-strong)]">仅总览和资料两栏</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel-card p-6 sm:p-8">
        <div className="section-badge">Login</div>
        <h2 className="section-title mt-3">
          欢迎回来
        </h2>
        <p className="page-copy mt-3">
          用用户名或邮箱登录，进入文档工作台。
        </p>

        <form
          className="mt-7 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void loginRequest.run();
          }}
        >
          <TextInput
            label="用户名或邮箱"
            value={account}
            onChange={(event) => setAccount(event.currentTarget.value)}
            radius="xl"
            size="md"
            required
          />
          <PasswordInput
            label="密码"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            radius="xl"
            size="md"
            required
          />

          {errorMessage ? (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="xl"
              title="登录失败"
            >
              {errorMessage}
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="admin-primary-btn w-full justify-center"
            disabled={loginRequest.loading}
          >
            <LogIn />
            {loginRequest.loading ? "登录中..." : "登录 ExamStack"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-ink-soft)]">
          还没有账号？
          <Link to="/register" className="ml-2 font-semibold text-[var(--color-sky-strong)]">
            立即注册
          </Link>
        </p>
      </section>
    </div>
  );
}
