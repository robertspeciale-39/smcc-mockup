// Rules for Board photos. No database needed:  npm test  runs this file along with the others.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ServiceError, type Viewer } from "@/lib/permissions";
import { assertMayUploadPhoto, checkPhoto, isBoardPhotoUrl, PHOTO_MAX_BYTES, sniffPhotoType } from "@/lib/photo";

const viewer = (over: Partial<Viewer> = {}): Viewer => ({
  id: "u1",
  name: "Test",
  email: "t@example.test",
  image: null,
  tier: "member",
  role: "user",
  status: "active",
  city: "Las Vegas",
  ...over,
});

const code = (fn: () => unknown): string => {
  try {
    fn();
  } catch (e) {
    if (e instanceof ServiceError) return e.code;
    throw e;
  }
  return "ok";
};

// Just enough leading bytes for each format, followed by padding.
const bytes = (head: number[], total = 64) => Uint8Array.from([...head, ...new Array(Math.max(total - head.length, 0)).fill(0)]);
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
const GIF = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
const PDF = [0x25, 0x50, 0x44, 0x46];

describe("who may add a photo", () => {
  it("allows members, founders and hosts", () => {
    assert.equal(code(() => assertMayUploadPhoto(viewer())), "ok");
    assert.equal(code(() => assertMayUploadPhoto(viewer({ tier: "founder" }))), "ok");
    assert.equal(code(() => assertMayUploadPhoto(viewer({ tier: "guest", role: "admin" }))), "ok");
  });

  it("refuses signed-out visitors, guests and suspended accounts", () => {
    assert.equal(code(() => assertMayUploadPhoto(null)), "unauthorized");
    assert.equal(code(() => assertMayUploadPhoto(viewer({ tier: "guest" }))), "forbidden");
    assert.equal(code(() => assertMayUploadPhoto(viewer({ status: "suspended" }))), "forbidden");
  });
});

describe("what photo is accepted", () => {
  it("reads the real type from the file's first bytes", () => {
    assert.equal(sniffPhotoType(bytes(JPEG)), "image/jpeg");
    assert.equal(sniffPhotoType(bytes(PNG)), "image/png");
    assert.equal(sniffPhotoType(bytes(WEBP)), "image/webp");
    assert.equal(sniffPhotoType(bytes(GIF)), null);
    assert.equal(sniffPhotoType(bytes(PDF)), null);
    assert.equal(sniffPhotoType(new Uint8Array(0)), null);
  });

  it("accepts JPG, PNG and WebP up to the size limit", () => {
    assert.equal(checkPhoto(bytes(JPEG)), "image/jpeg");
    assert.equal(checkPhoto(bytes(PNG)), "image/png");
    assert.equal(checkPhoto(bytes(WEBP)), "image/webp");
    assert.equal(checkPhoto(bytes(JPEG, PHOTO_MAX_BYTES)), "image/jpeg");
  });

  it("rejects oversized files and other file types", () => {
    assert.equal(code(() => checkPhoto(bytes(JPEG, PHOTO_MAX_BYTES + 1))), "invalid");
    assert.equal(code(() => checkPhoto(bytes(GIF))), "invalid");
    assert.equal(code(() => checkPhoto(bytes(PDF))), "invalid");
    // A text file renamed to .jpg has no JPEG header, so it fails no matter what the browser claims.
    assert.equal(code(() => checkPhoto(new TextEncoder().encode("<script>alert(1)</script>"))), "invalid");
  });
});

describe("which photo addresses a post may use", () => {
  const good = "https://abc123xyz.public.blob.vercel-storage.com/board/11111111-1111-4111-8111-111111111111.jpg";

  it("accepts the club's own storage", () => {
    assert.equal(isBoardPhotoUrl(good), true);
  });

  it("rejects everything else", () => {
    for (const bad of [
      "",
      "not a url",
      good.replace("https:", "http:"),
      good.replace("/board/", "/other/"),
      good.replace("/board/", "/board/sub/"),
      "https://evil.example.com/board/a.jpg",
      "https://public.blob.vercel-storage.com.evil.example.com/board/a.jpg",
      "https://abc123xyz.public.blob.vercel-storage.com@evil.example.com/board/a.jpg",
      "https://abc123xyz.public.blob.vercel-storage.com:8443/board/a.jpg",
      "javascript:alert(1)",
    ]) {
      assert.equal(isBoardPhotoUrl(bad), false, bad);
    }
  });
});
