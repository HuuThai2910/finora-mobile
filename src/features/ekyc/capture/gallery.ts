import * as ImagePicker from 'expo-image-picker';
import { finalizeCardShot } from './cardImage';
import type { CardShot } from './types';

/**
 * Chọn ảnh thẻ có sẵn trong thư viện — lối thoát khi một mặt bị yêu cầu chụp lại nhiều lần
 * liên tiếp (camera máy quá mờ). Không thuộc cơ chế nguồn chụp: chỉ hiện sau 2 lần RETAKE
 * liên tiếp, và server coi `GALLERY` là nguồn yếu nên hồ sơ tối đa là "chờ duyệt".
 *
 * Bộ chọn ảnh hệ thống (Android 13+, iOS 14+) không cần quyền thư viện. Ảnh HEIC được đổi
 * sang JPEG ở bước xử lý chung. Trả `null` khi người dùng đóng bộ chọn.
 */
export async function pickCardFromGallery(otherSideHasQr: boolean): Promise<CardShot | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
    exif: false,
  });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;

  return finalizeCardShot(
    { uri: asset.uri, width: asset.width, height: asset.height },
    { source: 'GALLERY', liveQr: null, skipStillScan: otherSideHasQr },
  );
}
