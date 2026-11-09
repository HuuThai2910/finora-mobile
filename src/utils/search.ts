/**
 * Chữ thường, bỏ dấu và gộp khoảng trắng để so khớp: người dùng hay gõ không
 * dấu ("tieu dung"), còn chữ admin/người vay nhập có thể ở dạng Unicode dựng sẵn hoặc tổ
 * hợp. "đ" không tách dấu theo chuẩn Unicode nên phải đổi riêng.
 */
export function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
