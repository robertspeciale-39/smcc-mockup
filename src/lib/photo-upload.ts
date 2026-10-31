import "server-only";
import { put } from "@vercel/blob";
import { assertMayUploadPhoto, checkPhoto, PHOTO_TYPES } from "@/lib/photo";
import { ServiceError, type MaybeViewer } from "@/lib/permissions";

// Stores one Board photo and returns its web address. The address is long and unguessable.
export async function uploadBoardPhoto(viewer: MaybeViewer, file: File): Promise<string> {
  assertMayUploadPhoto(viewer);
  // Newer Blob stores sign in with BLOB_STORE_ID and Vercel's own credential; older ones use a token.
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    throw new ServiceError("invalid", "Photo uploads aren't switched on yet.");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = checkPhoto(bytes);
  const blob = await put(`board/${crypto.randomUUID()}.${PHOTO_TYPES[type]}`, file, {
    access: "public",
    contentType: type,
    addRandomSuffix: false,
  });
  return blob.url;
}
