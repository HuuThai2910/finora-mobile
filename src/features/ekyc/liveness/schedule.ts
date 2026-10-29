import type { LivenessStep } from '@/types/ekyc';

/** Chu kỳ kiểm tra điều kiện dừng khi chờ hết một bước. */
const POLL_MS = 100;

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/** Chờ tới mốc `deadline` (epoch ms); trả `false` nếu bị dừng giữa chừng. */
export async function waitUntil(deadline: number, shouldStop: () => boolean): Promise<boolean> {
  while (Date.now() < deadline) {
    if (shouldStop()) return false;
    await sleep(Math.min(POLL_MS, Math.max(0, deadline - Date.now())));
  }
  return !shouldStop();
}

export const totalHoldMs = (steps: readonly LivenessStep[]): number =>
  steps.reduce((sum, step) => sum + step.holdMs, 0);

/**
 * Chạy lịch nhắc theo `steps[].holdMs` của server: báo bước hiện tại qua `onStep`, giữ đúng
 * thời lượng từng bước. Mốc của mỗi bước tính từ lúc bắt đầu (không cộng dồn độ trễ của
 * `setTimeout`) vì server chấm khoảng cách giữa các động tác theo đúng nhịp này.
 *
 * Trả `true` khi chạy hết lịch, `false` khi `shouldStop` báo dừng (rời màn, máy ngừng quay).
 */
export async function runSchedule(
  steps: readonly LivenessStep[],
  onStep: (index: number) => void,
  shouldStop: () => boolean,
): Promise<boolean> {
  let deadline = Date.now();
  for (let index = 0; index < steps.length; index += 1) {
    if (shouldStop()) return false;
    onStep(index);
    deadline += steps[index].holdMs;
    if (!(await waitUntil(deadline, shouldStop))) return false;
  }
  return true;
}
