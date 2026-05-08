import { Alert, PasswordInput, TextInput } from "@mantine/core";
import { useRequest } from "ahooks";
import { AlertCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { getCurrentUser, login } from "@/api/auth";
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
      const user = await getCurrentUser();
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
    <div className="grid min-h-[78dvh] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hero-campus hidden h-full min-h-[620px] p-8 lg:block">
        <div className="flex h-full max-w-xl flex-col justify-between">
          <BrandMark />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[oklch(0.45_0.12_35)]">
              回到资料流中心
            </p>
            <h1 className="mt-4 font-heading text-5xl font-black leading-none text-[oklch(0.24_0.05_255)]">
              登录后继续
              <br />
              你的期末共享循环
            </h1>
            <p className="mt-5 max-w-[40ch] text-sm leading-8 text-[oklch(0.39_0.04_248)]">
              查看自己的积分、继续上传笔记、下载同学整理好的重点资料，一切都从这里接回。
            </p>
          </div>
          <div className="grid gap-3 text-sm text-[oklch(0.36_0.04_250)]">
            <p className="rounded-[1.4rem] bg-[oklch(0.98_0.03_94/.86)] px-4 py-3">
              上传资料 +5 积分
            </p>
            <p className="rounded-[1.4rem] bg-[oklch(0.98_0.03_94/.86)] px-4 py-3">
              下载资料 -5 积分
            </p>
            <p className="rounded-[1.4rem] bg-[oklch(0.98_0.03_94/.86)] px-4 py-3">
              你的资料会被更多同学看到
            </p>
          </div>
        </div>
      </section>

      <section className="campus-panel p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[oklch(0.47_0.05_250)]">
          Login
        </p>
        <h2 className="mt-3 font-heading text-4xl font-black text-[oklch(0.23_0.05_255)]">
          欢迎回来
        </h2>
        <p className="mt-3 text-sm leading-7 text-[oklch(0.41_0.03_250)]">
          用用户名或邮箱登录，回到你的资料空间。
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
            className="w-full rounded-full bg-[oklch(0.27_0.06_250)] text-[oklch(0.98_0.02_95)]"
            disabled={loginRequest.loading}
          >
            <LogIn />
            {loginRequest.loading ? "登录中..." : "登录 ExamStack"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-[oklch(0.42_0.03_250)]">
          还没有账号？
          <Link to="/register" className="ml-2 font-semibold text-[oklch(0.45_0.13_30)]">
            立即注册
          </Link>
        </p>
      </section>
    </div>
  );
}
