// Rules for Board photos. No framework or storage imports, so tests and the browser can both use this.

import { canParticipate, ServiceError, type MaybeViewer } from "@/lib/permissions";

// The browser shrinks every photo before upload, so real uploads are far smaller than this.
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
// What a person may pick on their device, before the browser shrinks it.
export const PHOTO_PICK_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_MAX_SIDE = 1600;

export const PHOTO_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
export type PhotoType = keyof typeof PHOTO_TYPES;

// Only photos stored by the club's own Vercel Blob store, under /board/, may be attached to a post.
export function isBoardPhotoUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(u.hostname) &&
      /^\/board\/[A-Za-z0-9._-]+$/.test(u.pathname)
    );
  } catch {
    return false;
  }
}

// The file's real type, read from its first bytes. The type the browser claims is not trusted.
export function sniffPhotoType(b: Uint8Array): PhotoType | null {
  const at = (i: number, ...v: number[]) => v.every((x, k) => b[i + k] === x);
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}

export function assertMayUploadPhoto(viewer: MaybeViewer): void {
  if (!viewer) throw new ServiceError("unauthorized", "Sign in to add a photo.");
  if (!canParticipate(viewer)) throw new ServiceError("forbidden", "Photos are for members. Ask a club host to approve your account.");
}

// Checks a photo that is about to be stored and returns its type.
export function checkPhoto(bytes: Uint8Array): PhotoType {
  if (bytes.byteLength > PHOTO_MAX_BYTES) {
    throw new ServiceError("invalid", "That photo is too big. Photos can be up to 2 MB after resizing.");
  }
  const type = sniffPhotoType(bytes);
  if (!type) throw new ServiceError("invalid", "Photos must be JPG, PNG or WebP.");
  return type;
}
