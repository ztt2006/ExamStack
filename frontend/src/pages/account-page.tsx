import { Alert, Loader, Modal, TextInput } from "@mantine/core";
import { useRequest } from "ahooks";
import { AlertCircle, Medal, Pencil, UserCircle2 } from "lucide-react";
import { useState } from "react";

import { getMyProfile, updateMyProfile } from "@/api/users";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  hasAuthErrors,
  validateEmail,
  validateProfileForm,
  validateSchool,
  validateUsername,
} from "@/utils/auth-validation";

export function AccountPage() {
  const [profileEditOpened, setProfileEditOpened] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSchool, setProfileSchool] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [profileFieldErrors, setProfileFieldErrors] = useState<{
    username?: string;
    email?: string;
    school?: string;
  }>({});
  const setUser = useAuthStore((state) => state.setUser);

  const profileRequest = useRequest(getMyProfile);

  const refreshData = async () => {
    await profileRequest.refresh();
  };

  const profileUpdateRequest = useRequest(
    async () => {
      setProfileErrorMessage("");
      const nextErrors = validateProfileForm({
        username: profileUsername,
        email: profileEmail,
        school: profileSchool,
      });
      setProfileFieldErrors(nextErrors);
      if (hasAuthErrors(nextErrors)) {
        return;
      }

      const updatedUser = await updateMyProfile({
        username: profileUsername.trim(),
        email: profileEmail.trim(),
        school: profileSchool.trim(),
      });
      setUser(updatedUser);
      setProfileEditOpened(false);
      await refreshData();
    },
    {
      manual: true,
      onError: (error) => {
        setProfileErrorMessage(error instanceof Error ? error.message : "个人信息更新失败，请稍后再试。");
      },
    },
  );

  if (profileRequest.loading && !profileRequest.data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader color="sky" />
      </div>
    );
  }

  if (profileRequest.error || !profileRequest.data) {
    return (
      <Alert
        icon={<AlertCircle size={16} />}
        radius="xl"
        color="red"
        title="个人中心加载失败"
      >
        请确认登录状态正常，并检查后端服务是否可用。
      </Alert>
    );
  }

  const profile = profileRequest.data;
  const progressValue = Math.min((profile.points / 50) * 100, 100);

  const openProfileEditModal = () => {
    setProfileUsername(profile.username);
    setProfileEmail(profile.email);
    setProfileSchool(profile.school);
    setProfileFieldErrors({});
    setProfileErrorMessage("");
    setProfileEditOpened(true);
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-card hero-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="section-badge">Profile Hub</div>
              <h1 className="section-title mt-3 text-[2.35rem]">{profile.username} 的个人中心</h1>
              <p className="page-copy mt-3">
                {profile.school} · 在这里维护你的账号信息、查看积分状态，并保持个人资料始终最新。
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="metric-icon h-14 w-14">
                <UserCircle2 size={30} />
              </div>
              <Button type="button" className="admin-secondary-btn" onClick={openProfileEditModal}>
                <Pencil />
                编辑个人信息
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="metric-card">
              <p className="metric-label">用户名</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                {profile.username}
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-label">学校</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                {profile.school}
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-label">我的上传</p>
              <p className="metric-value">{profile.uploaded_count}</p>
            </div>
          </div>
        </div>

        <div className="panel-card p-6">
          <div className="flex items-center gap-3">
            <div className="metric-icon h-11 w-11">
              <Medal size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">
                Account Snapshot
              </p>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                当前账号信息
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.1rem] border border-[oklch(0.9_0.03_230)] bg-[oklch(0.995_0.012_232/.92)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">邮箱</p>
              <p className="mt-2 text-base font-semibold text-[var(--color-ink-strong)]">{profile.email}</p>
            </div>
            <div className="rounded-[1.1rem] border border-[oklch(0.9_0.03_230)] bg-[oklch(0.995_0.012_232/.92)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">积分</p>
              <p className="mt-2 text-base font-semibold text-[var(--color-ink-strong)]">{profile.points}</p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[oklch(0.93_0.02_232)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(135deg,oklch(0.74_0.11_218),oklch(0.65_0.13_236))]"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <p className="page-copy mt-4">
            继续上传资料可以补回积分，同时也会让你的个人中心数据更完整。
          </p>
        </div>
      </section>

      <Modal
        opened={profileEditOpened}
        onClose={() => setProfileEditOpened(false)}
        title="编辑个人信息"
        centered
        radius="xl"
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void profileUpdateRequest.run();
          }}
        >
          <TextInput
            label="用户名"
            value={profileUsername}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setProfileUsername(nextValue);
              if (profileFieldErrors.username) {
                setProfileFieldErrors((current) => ({
                  ...current,
                  username: validateUsername(nextValue),
                }));
              }
            }}
            onBlur={() =>
              setProfileFieldErrors((current) => ({
                ...current,
                username: validateUsername(profileUsername),
              }))
            }
            radius="xl"
            error={profileFieldErrors.username}
            description="3-50 个字符，可使用中文、字母、数字、下划线或短横线。"
            required
          />
          <TextInput
            label="邮箱"
            type="email"
            value={profileEmail}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setProfileEmail(nextValue);
              if (profileFieldErrors.email) {
                setProfileFieldErrors((current) => ({
                  ...current,
                  email: validateEmail(nextValue),
                }));
              }
            }}
            onBlur={() =>
              setProfileFieldErrors((current) => ({
                ...current,
                email: validateEmail(profileEmail),
              }))
            }
            radius="xl"
            error={profileFieldErrors.email}
            required
          />
          <TextInput
            label="学校"
            value={profileSchool}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setProfileSchool(nextValue);
              if (profileFieldErrors.school) {
                setProfileFieldErrors((current) => ({
                  ...current,
                  school: validateSchool(nextValue),
                }));
              }
            }}
            onBlur={() =>
              setProfileFieldErrors((current) => ({
                ...current,
                school: validateSchool(profileSchool),
              }))
            }
            radius="xl"
            error={profileFieldErrors.school}
            required
          />

          {profileErrorMessage ? (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="xl"
              title="更新失败"
            >
              {profileErrorMessage}
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="admin-primary-btn w-full justify-center"
            disabled={profileUpdateRequest.loading}
          >
            <Pencil />
            {profileUpdateRequest.loading ? "正在保存..." : "保存个人信息"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
