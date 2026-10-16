/**
 * Bộ đọc Markdown tối giản cho điều khoản eKYC — chỉ đủ cú pháp server dùng (plan nền tảng
 * mục 7): tiêu đề `###`, dòng chỉ gồm `**…**`, gạch đầu dòng `- `, đường kẻ `---`, đoạn văn,
 * và trong dòng `**đậm**` / `*nghiêng*`. Không kéo thư viện Markdown vào app chỉ cho một màn.
 *
 * Chú thích HTML (`<!-- … -->`) bị bỏ như Markdown chuẩn — server đã xử lý khối điều kiện,
 * nếu còn sót dấu mở/đóng thì cũng không hiện ra cho người dùng.
 */

export type InlineSpan = { text: string; bold?: boolean; italic?: boolean };

export type MarkdownBlock =
  | { kind: 'heading'; spans: InlineSpan[] }
  | { kind: 'label'; spans: InlineSpan[] }
  | { kind: 'bullet'; spans: InlineSpan[] }
  | { kind: 'paragraph'; spans: InlineSpan[] }
  | { kind: 'divider' };

const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;

export function parseInline(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > cursor) spans.push({ text: text.slice(cursor, index) });
    if (match[1] !== undefined) spans.push({ text: match[1], bold: true });
    else if (match[2] !== undefined) spans.push({ text: match[2], italic: true });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) spans.push({ text: text.slice(cursor) });
  return spans;
}

export function parseConsentMarkdown(body: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];

  // Các dòng liền nhau là một đoạn (xuống dòng mềm), như Markdown chuẩn.
  const flush = () => {
    if (paragraph.length > 0) blocks.push({ kind: 'paragraph', spans: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };

  for (const raw of body.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (/^<!--.*-->$/.test(line)) {
      continue;
    } else if (/^#{1,6}\s+/.test(line)) {
      flush();
      blocks.push({ kind: 'heading', spans: parseInline(line.replace(/^#{1,6}\s+/, '')) });
    } else if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flush();
      blocks.push({ kind: 'divider' });
    } else if (/^-\s+/.test(line)) {
      flush();
      blocks.push({ kind: 'bullet', spans: parseInline(line.replace(/^-\s+/, '')) });
    } else if (/^\*\*[^*]+\*\*$/.test(line)) {
      flush();
      blocks.push({ kind: 'label', spans: [{ text: line.slice(2, -2), bold: true }] });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
