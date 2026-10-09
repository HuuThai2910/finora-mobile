import { useState } from 'react';
import { Linking } from 'react-native';
import { toUserMessage } from '@/lib/api';
import type { TopUpOrder } from '@/types/wallet';
import { completeMockTopUp, createTopUp, getTopUp } from '../api';

/** Thao tác đang chạy; nút tương ứng hiện vòng xoay, các nút còn lại khoá theo. */
export type TopUpBusy = 'create' | 'refresh' | 'complete' | null;

/**
 * Điều phối một lần nạp tiền trên màn TopUp: tạo lệnh, hỏi lại trạng thái, giả lập thanh toán (chỉ
 * khi backend chạy MOCK) và mở trang ZaloPay.
 *
 * Lệnh chỉ được theo dõi trong màn này: rời màn là thôi theo dõi, còn lệnh vẫn nằm ở backend. Mọi
 * thao tác dùng chung một cờ `busy` để không gửi hai request chồng nhau khi người dùng bấm lặp.
 */
export function useTopUp() {
  const [order, setOrder] = useState<TopUpOrder | null>(null);
  const [busy, setBusy] = useState<TopUpBusy>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: Exclude<TopUpBusy, null>, task: () => Promise<TopUpOrder>) => {
    if (busy) return;
    setBusy(kind);
    setError(null);
    try {
      setOrder(await task());
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const create = (amount: number) => run('create', () => createTopUp(amount));

  const refresh = () => {
    if (order) void run('refresh', () => getTopUp(order.topUpId));
  };

  const completeMock = () => {
    if (order) void run('complete', () => completeMockTopUp(order.topUpId));
  };

  const openProvider = async () => {
    if (!order?.checkoutUrl) return;
    setError(null);
    try {
      if (!(await Linking.canOpenURL(order.checkoutUrl))) throw new Error('unsupported');
      await Linking.openURL(order.checkoutUrl);
    } catch {
      setError('Thiết bị không mở được liên kết thanh toán ZaloPay.');
    }
  };

  /** Quay về bước nhập số tiền để tạo lệnh mới; lệnh cũ chưa thanh toán vẫn nằm ở backend. */
  const reset = () => {
    setOrder(null);
    setError(null);
  };

  return { order, busy, error, create, refresh, completeMock, openProvider, reset };
}
