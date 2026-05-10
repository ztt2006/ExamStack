import { getProfilePointSummary } from "./profile-summary";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const starting = getProfilePointSummary(0, 0);
assert(starting.progressValue === 0, "zero points should start at 0 progress");
assert(starting.tone === "needs-work", "zero points should encourage first upload");
assert(starting.nextAction === "先上传一份资料，个人中心就会亮起来。", "zero state copy mismatch");

const active = getProfilePointSummary(28, 3);
assert(active.progressValue === 56, "points should map to the 50 point milestone");
assert(active.tone === "steady", "mid range points should be steady");
assert(active.caption.includes("22 分"), "mid range caption should mention remaining points");

const complete = getProfilePointSummary(82, 9);
assert(complete.progressValue === 100, "progress should cap at 100");
assert(complete.tone === "excellent", "high points should be excellent");
assert(complete.nextAction === "你已经是稳定贡献者，可以继续维护高质量资料。", "complete state copy mismatch");
