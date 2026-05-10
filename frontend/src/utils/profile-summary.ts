export type ProfilePointTone = "needs-work" | "steady" | "excellent";

export interface ProfilePointSummary {
  caption: string;
  nextAction: string;
  progressValue: number;
  tone: ProfilePointTone;
}

const POINT_MILESTONE = 50;

export function getProfilePointSummary(points: number, uploadedCount: number): ProfilePointSummary {
  const normalizedPoints = Math.max(0, points);
  const progressValue = Math.min(Math.round((normalizedPoints / POINT_MILESTONE) * 100), 100);

  if (normalizedPoints >= POINT_MILESTONE) {
    return {
      caption: `已超过 ${POINT_MILESTONE} 分贡献里程碑，累计上传 ${uploadedCount} 份资料。`,
      nextAction: "你已经是稳定贡献者，可以继续维护高质量资料。",
      progressValue,
      tone: "excellent",
    };
  }

  if (normalizedPoints > 0 || uploadedCount > 0) {
    const remainingPoints = POINT_MILESTONE - normalizedPoints;
    return {
      caption: `距离 ${POINT_MILESTONE} 分贡献里程碑还差 ${remainingPoints} 分。`,
      nextAction: "继续上传清晰、有描述的资料，可以更快积累积分。",
      progressValue,
      tone: "steady",
    };
  }

  return {
    caption: "还没有形成积分记录，先从第一份资料开始。",
    nextAction: "先上传一份资料，个人中心就会亮起来。",
    progressValue,
    tone: "needs-work",
  };
}
