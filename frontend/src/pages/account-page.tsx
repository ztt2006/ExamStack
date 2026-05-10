import { Alert, FileInput, Loader, Modal, TextInput } from "@mantine/core";
import { useRequest } from "ahooks";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  Camera,
  CheckCircle2,
  IdCard,
  ImageUp,
  Mail,
  Medal,
  Pencil,
  School,
  Sparkles,
  UploadCloud,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { getMyProfile, updateMyProfile, uploadMyAvatar } from "@/api/users";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { resolveBackendUrl } from "@/utils/resource";
import { getProfilePointSummary, type ProfilePointTone } from "@/utils/profile-summary";
import {
  hasAuthErrors,
  validateEmail,
  validateProfileForm,
  validateSchool,
  validateUsername,
} from "@/utils/auth-validation";

const pointToneLabels: Record<ProfilePointTone, string> = {
  "needs-work": "待点亮",
  steady: "稳步积累",
  excellent: "贡献稳定",
};

const pointToneClasses: Record<ProfilePointTone, string> = {
  "needs-work": "border-amber-200 bg-amber-50 text-amber-700",
  steady: "border-blue-200 bg-blue-50 text-blue-700",
  excellent: "border-green-200 bg-green-50 text-green-700",
};

function getInitials(username: string) {
  return username.trim().slice(0, 2).toUpperCase();
}

export function AccountPage() {
  const [profileEditOpened, setProfileEditOpened] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSchool, setProfileSchool] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [avatarErrorMessage, setAvatarErrorMessage] = useState("");
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

  const avatarUploadRequest = useRequest(
    async () => {
      if (!avatarFile) {
        setAvatarErrorMessage("请先选择一张图片。");
        return;
      }

      setAvatarErrorMessage("");
      const updatedUser = await uploadMyAvatar(avatarFile);
      setUser(updatedUser);
      setAvatarFile(null);
      await refreshData();
    },
    {
      manual: true,
      onError: (error) => {
        setAvatarErrorMessage(error instanceof Error ? error.message : "头像上传失败，请稍后再试。");
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
  const pointSummary = getProfilePointSummary(profile.points, profile.uploaded_count);
  const initials = getInitials(profile.username);
  const progressValue = pointSummary.progressValue;
  const avatarSrc = profile.avatar_url ? resolveBackendUrl(profile.avatar_url) : "";
  const profileStats = [
    {
      label: "我的上传",
      value: profile.uploaded_count,
      caption: "累计共享资料",
      icon: UploadCloud,
    },
    {
      label: "当前积分",
      value: profile.points,
      caption: "下载与上传余额",
      icon: WalletCards,
    },
    {
      label: "所在学校",
      value: profile.school,
      caption: "资料归属更可信",
      icon: School,
    },
    {
      label: "用户编号",
      value: `#${profile.id}`,
      caption: "账号身份标识",
      icon: IdCard,
    },
  ];
  const accountDetails = [
    {
      label: "登录邮箱",
      value: profile.email,
      icon: Mail,
    },
    {
      label: "展示昵称",
      value: profile.username,
      icon: BadgeCheck,
    },
    {
      label: "学校信息",
      value: profile.school,
      icon: School,
    },
  ];

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
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-card hero-panel p-6 sm:p-8">
          <div className="relative z-10 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[#2563eb]">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${profile.username} 的头像`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-heading text-4xl font-extrabold text-white">
                  {initials}
                </div>
              )}
              <div className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-lg border border-[var(--admin-border)] bg-white text-[var(--admin-primary)]">
                <Camera size={18} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="section-badge">Profile</div>
              <h1 className="section-title mt-3 text-[clamp(2rem,4vw,3.05rem)]">
                {profile.username}
              </h1>
              <p className="page-copy mt-3 max-w-2xl">
                来自 {profile.school}。在这里维护头像和账号资料，顺手查看你的资料贡献、积分状态和账号可信信息。
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" className="admin-secondary-btn" onClick={openProfileEditModal}>
                  <Pencil />
                  编辑资料
                </Button>
                <Link to="/my-uploads" className="admin-primary-btn inline-flex items-center gap-2">
                  <UploadCloud size={16} />
                  管理上传
                </Link>
              </div>
            </div>
          </div>

          <form
            className="relative z-10 mt-7 grid gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4 sm:grid-cols-[1fr_auto] sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              void avatarUploadRequest.run();
            }}
          >
            <FileInput
              label="头像上传"
              placeholder="选择 JPG、PNG、WebP 或 GIF 图片"
              value={avatarFile}
              onChange={(file) => {
                setAvatarFile(file);
                setAvatarErrorMessage("");
              }}
              accept="image/png,image/jpeg,image/webp,image/gif"
              radius="md"
              clearable
              leftSection={<ImageUp size={16} />}
            />
            <Button
              type="submit"
              className="admin-primary-btn justify-center"
              disabled={avatarUploadRequest.loading || !avatarFile}
            >
              <ImageUp />
              {avatarUploadRequest.loading ? "正在上传..." : "更新头像"}
            </Button>

            {avatarErrorMessage ? (
              <Alert
                icon={<AlertCircle size={16} />}
                color="red"
                radius="xl"
                title="头像上传失败"
                className="sm:col-span-2"
              >
                {avatarErrorMessage}
              </Alert>
            ) : null}
            {!avatarErrorMessage && profile.avatar_url ? (
              <p className="flex items-center gap-2 text-sm font-medium text-[oklch(0.43_0.1_154)] sm:col-span-2">
                <CheckCircle2 size={16} />
                当前头像已同步到个人资料。
              </p>
            ) : null}
          </form>
        </div>

        <div className="panel-card p-6">
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="metric-icon h-11 w-11">
                  <Medal size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--admin-primary)]">
                    Contribution
                  </p>
                  <h2 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                    积分状态
                  </h2>
                </div>
              </div>
              <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${pointToneClasses[pointSummary.tone]}`}>
                {pointToneLabels[pointSummary.tone]}
              </span>
            </div>

            <div className="mt-7">
              <p className="font-heading text-5xl font-extrabold text-[var(--color-ink-strong)]">
                {profile.points}
                <span className="ml-2 text-base font-semibold text-[var(--color-ink-soft)]">积分</span>
              </p>
              <p className="page-copy mt-3">{pointSummary.caption}</p>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-lg bg-[#eef2f7]">
              <div
                className="h-full rounded-lg bg-[#2563eb]"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <p className="page-copy mt-4">{pointSummary.nextAction}</p>

            <Link to="/my-uploads" className="admin-secondary-btn mt-6 inline-flex items-center gap-2">
              <Sparkles size={16} />
              上传新资料
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {profileStats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="metric-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="metric-label mt-0">{item.label}</p>
                  <p className="metric-value break-words">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{item.caption}</p>
                </div>
                <div className="metric-icon shrink-0">
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel-card p-6">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase text-[var(--admin-primary)]">
              Account Snapshot
            </p>
            <h2 className="section-title mt-2">当前账号信息</h2>
            <div className="mt-5 space-y-3">
              {accountDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="detail-row">
                    <Icon size={18} className="shrink-0 text-[var(--color-sky-strong)]" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-ink-soft)]">{item.label}</p>
                      <p className="break-words text-sm font-semibold text-[var(--color-ink-strong)]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel-card p-6">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="metric-icon h-11 w-11">
                <BookOpenCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[var(--admin-primary)]">
                  Next Steps
                </p>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                  让个人资料更完整
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/my-uploads" className="quick-link-card">
                <span className="inline-flex items-center gap-2">
                  <UploadCloud size={16} />
                  上传资料
                </span>
                <ArrowUpRight size={15} />
              </Link>
              <Link to="/resources" className="quick-link-card">
                <span className="inline-flex items-center gap-2">
                  <BookOpenCheck size={16} />
                  浏览资料库
                </span>
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <p className="page-copy mt-5">
              头像、学校、邮箱和上传记录会一起构成你的资料可信度。保持信息清晰，其他同学更容易识别你的贡献。
            </p>
          </div>
        </div>
      </section>

      <Modal
        opened={profileEditOpened}
        onClose={() => setProfileEditOpened(false)}
        title={
          <div>
            <p className="text-xs font-bold uppercase text-[var(--admin-primary)]">
              Profile
            </p>
            <h2 className="mt-1 font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
              编辑个人资料
            </h2>
          </div>
        }
        centered
        radius="md"
        size="lg"
        padding={0}
        overlayProps={{ opacity: 0.36, blur: 0 }}
        classNames={{
          content: "overflow-hidden border border-[var(--admin-border)] bg-white",
          header: "border-b border-[var(--admin-border)] bg-white px-6 py-5",
          body: "bg-white",
          close: "rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--admin-soft)]",
        }}
      >
        <form
          className="grid gap-5 p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void profileUpdateRequest.run();
          }}
        >
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[#2563eb]">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={`${profile.username} 的头像`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-heading text-xl font-extrabold text-white">
                    {initials}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-semibold text-[var(--color-ink-strong)]">
                  {profile.username}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">
                  修改后会同步到导航、个人中心和你的资料展示信息。
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border border-[var(--admin-border)] bg-white p-3">
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
                radius="md"
                size="md"
                leftSection={<BadgeCheck size={16} />}
                error={profileFieldErrors.username}
                description="3-50 个字符，可使用中文、字母、数字、下划线或短横线。"
                autoComplete="username"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--admin-border)] bg-white p-3">
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
                  radius="md"
                  size="md"
                  leftSection={<Mail size={16} />}
                  error={profileFieldErrors.email}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="rounded-lg border border-[var(--admin-border)] bg-white p-3">
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
                  radius="md"
                  size="md"
                  leftSection={<School size={16} />}
                  error={profileFieldErrors.school}
                  autoComplete="organization"
                  required
                />
              </div>
            </div>
          </div>

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

          <div className="flex flex-col-reverse gap-3 border-t border-[oklch(0.9_0.03_230)] pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="admin-secondary-btn justify-center"
              onClick={() => setProfileEditOpened(false)}
              disabled={profileUpdateRequest.loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              size="lg"
              className="admin-primary-btn justify-center sm:min-w-40"
              disabled={profileUpdateRequest.loading}
            >
              <Pencil />
              {profileUpdateRequest.loading ? "正在保存..." : "保存资料"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
