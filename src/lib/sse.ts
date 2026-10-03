/**
 * Client Server-Sent Events tối giản trên XMLHttpRequest.
 *
 * React Native không có `EventSource`, còn `EventSource` của trình duyệt lại không gắn được header
 * `Authorization` — trong khi mobile xác thực bằng bearer token. XHR đọc được phần thân trả về dần
 * dần (`readyState` 3) trên cả iOS, Android và web, nên đủ để đọc luồng SSE.
 *
 * Chỉ hỗ trợ phần giao thức FINORA dùng: dòng `event:`, `data:`, `id:` và dòng chú thích `:` (gói
 * giữ kết nối). Không tự kết nối lại — nơi gọi quyết định khi nào mở lại, vì token có thể đã đổi.
 */

export type StreamEvent = { event: string; data: string; id: string | null };

export type StreamOptions = {
  url: string;
  headers?: Record<string, string>;
  onOpen?: () => void;
  onEvent: (event: StreamEvent) => void;
  /** Gọi đúng một lần khi luồng hỏng hoặc server đóng; sau đó handle không còn dùng được. */
  onClose: (reason: StreamCloseReason) => void;
};

export type StreamCloseReason = { kind: 'http'; status: number } | { kind: 'network' } | { kind: 'ended' };

export type StreamHandle = { close: () => void };

/** Một sự kiện kết thúc bằng một dòng trống. */
const EVENT_BOUNDARY = /\r?\n\r?\n/;

export function openEventStream({ url, headers, onOpen, onEvent, onClose }: StreamOptions): StreamHandle {
  const xhr = new XMLHttpRequest();
  let cursor = 0;
  let pending = '';
  let finished = false;

  const finish = (reason: StreamCloseReason) => {
    if (finished) return;
    finished = true;
    onClose(reason);
  };

  const consume = () => {
    const text = xhr.responseText;
    if (text.length <= cursor) return;
    pending += text.slice(cursor);
    cursor = text.length;

    const blocks = pending.split(EVENT_BOUNDARY);
    // Phần sau dòng trống cuối cùng có thể chưa nhận đủ; giữ lại cho lần sau.
    pending = blocks.pop() ?? '';
    for (const block of blocks) {
      const parsed = parseBlock(block);
      if (parsed) onEvent(parsed);
    }
  };

  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.setRequestHeader('Cache-Control', 'no-cache');
  Object.entries(headers ?? {}).forEach(([name, value]) => xhr.setRequestHeader(name, value));

  xhr.onreadystatechange = () => {
    if (finished) return;
    if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
      if (xhr.status === 200) onOpen?.();
      return;
    }
    if (xhr.readyState === XMLHttpRequest.LOADING || xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status !== 200) {
        finish(xhr.status === 0 ? { kind: 'network' } : { kind: 'http', status: xhr.status });
        return;
      }
      consume();
      if (xhr.readyState === XMLHttpRequest.DONE) finish({ kind: 'ended' });
    }
  };
  xhr.onerror = () => finish({ kind: 'network' });
  xhr.send();

  return {
    close: () => {
      // Đóng chủ động không phải lỗi: không báo onClose để nơi gọi không tự mở lại.
      finished = true;
      xhr.abort();
    },
  };
}

function parseBlock(block: string): StreamEvent | null {
  let event = 'message';
  let id: string | null = null;
  const data: string[] = [];

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue;
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    // Giao thức cho phép một dấu cách sau dấu hai chấm.
    const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');
    if (field === 'event') event = value;
    else if (field === 'data') data.push(value);
    else if (field === 'id') id = value;
  }

  return data.length ? { event, data: data.join('\n'), id } : null;
}
