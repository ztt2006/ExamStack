import { Alert, PasswordInput, TextInput } from "@mantine/core";
import { useRequest } from "ahooks";
import { AlertCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { getCurrentUser, login, register } from "@/api/auth";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const registerRequest = useRequest(
    async () => {
      setErrorMessage("");
      await register({ username, email, school, password });
      const token = await login({ account: email, password });
      const user = await getCurrentUser();
      setSession(token.access_token, user);
      await navigate("/", { replace: true });
    },
    {
      manual: true,
    },
  );

  return (
    <div className="grid min-h-[78dvh] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="campus-panel order-2 p-6 sm:p-8 lg:order-1">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[oklch(0.47_0.05_250)]">
          Register
        </p>
        <h1 className="mt-3 font-heading text-4xl font-black text-[oklch(0.23_0.05_255)]">
          成为资料共享的一员
        </h1>
        <p className="mt-3 text-sm leading-7 text-[oklch(0.41_0.03_250)]">
          注册后默认获得 20 积分，你可以先浏览资料，也可以上传自己的整理内容为社区添火。
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
            onChange={(event) => setUsername(event.currentTarget.value)}
            radius="xl"
            required
          />
          <TextInput
            label="邮箱"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            radius="xl"
            required
          />
          <TextInput
            label="学校"
            value={school}
            onChange={(event) => setSchool(event.currentTarget.value)}
            radius="xl"
            required
          />
          <PasswordInput
            label="密码"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            radius="xl"
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
            className="w-full rounded-full bg-[oklch(0.63_0.18_29)] text-[oklch(0.98_0.02_95)]"
            disabled={registerRequest.loading}
          >
            <UserPlus />
            {registerRequest.loading ? "正在创建账号..." : "注册并进入社区"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-[oklch(0.42_0.03_250)]">
          已经有账号？
          <Link to="/login" className="ml-2 font-semibold text-[oklch(0.45_0.13_30)]">
            去登录
          </Link>
        </p>
      </section>

      <section className="hero-campus order-1 min-h-[620px] p-8 lg:order-2">
        <div className="flex h-full max-w-xl flex-col justify-between">
          <BrandMark />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[oklch(0.45_0.12_35)]">
              新同学入场
            </p>
            <h2 className="mt-4 font-heading text-5xl font-black leading-none text-[oklch(0.24_0.05_255)]">
              你的笔记
              <br />
              也值得被看见
            </h2>
            <p className="mt-5 max-w-[42ch] text-sm leading-8 text-[oklch(0.39_0.04_248)]">
              这不是一个冷清的文件夹站点，而是一条正在循环的校园资料流。你上传过的内容，会继续帮到下一位期末周的同学。
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.6rem] bg-[oklch(0.98_0.03_94/.86)] p-4">
              <p className="font-heading text-2xl font-black text-[oklch(0.28_0.05_255)]">20</p>
              <p className="mt-1 text-sm text-[oklch(0.39_0.04_248)]">初始积分</p>
            </div>
            <div className="rounded-[1.6rem] bg-[oklch(0.98_0.03_94/.86)] p-4">
              <p className="font-heading text-2xl font-black text-[oklch(0.28_0.05_255)]">+5</p>
              <p className="mt-1 text-sm text-[oklch(0.39_0.04_248)]">每次上传</p>
            </div>
            <div className="rounded-[1.6rem] bg-[oklch(0.98_0.03_94/.86)] p-4">
              <p className="font-heading text-2xl font-black text-[oklch(0.28_0.05_255)]">-5</p>
              <p className="mt-1 text-sm text-[oklch(0.39_0.04_248)]">每次下载</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
