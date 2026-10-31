"use client";

import { type ChangeEvent, useEffect, useId, useRef, useState } from "react";
import { PHOTO_MAX_BYTES, PHOTO_MAX_SIDE, PHOTO_PICK_MAX_BYTES } from "@/lib/photo";

// Shrinks a picture to at most 1600 px on its longest side and re-saves it as a JPEG. Re-saving also drops
// hidden data such as the place a phone photo was taken.
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");
  ctx.fillStyle = "#fff"; // see-through PNGs would otherwise turn black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.85, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", quality));
    if (blob && blob.size <= PHOTO_MAX_BYTES) return new File([blob], "photo.jpg", { type: "image/jpeg" });
  }
  throw new Error("Still too big");
}

// An "Add photo" button for a Board form. The shrunk copy replaces the chosen file inside the file input,
// so the form submits the small version without any extra wiring.
export function PhotoPicker() {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clear() {
    if (input.current) input.current.value = "";
    setPreview(null);
  }

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setMessage("");
    if (!file) return clear();
    if (file.size > PHOTO_PICK_MAX_BYTES) {
      clear();
      return setMessage("That photo is over 10 MB. Pick a smaller one.");
    }
    // Empty the input while resizing, so a quick submit sends no photo rather than the big original.
    const el = e.target;
    el.value = "";
    setMessage("Preparing photo...");
    try {
      const small = await shrink(file);
      const files = new DataTransfer();
      files.items.add(small);
      el.files = files.files;
      setPreview(URL.createObjectURL(small));
      setMessage("");
    } catch {
      clear();
      setMessage("Couldn't read that photo. Try a JPG, PNG or WebP.");
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-3">
        <input ref={input} id={id} type="file" name="photo" accept="image/jpeg,image/png,image/webp" onChange={onPick} className="peer sr-only" />
        <label
          htmlFor={id}
          className="cursor-pointer rounded-full border border-gold/40 px-3.5 py-1 text-sm text-haze hover:border-flamingo peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-flamingo"
        >
          {preview ? "Change photo" : "Add photo"}
        </label>
        {preview && (
          <button type="button" onClick={clear} className="text-sm text-haze hover:text-sand hover:underline">
            Remove photo
          </button>
        )}
        <p role="status" aria-live="polite" className="text-sm text-flamingo">{message}</p>
      </div>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Your photo, ready to post" className="mt-2 max-h-40 w-auto rounded border border-gold/25" />
      )}
    </div>
  );
}
