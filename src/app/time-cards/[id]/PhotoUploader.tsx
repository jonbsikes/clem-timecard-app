"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PhotoUploader({ entryId }: { entryId: string }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setErr(null);
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${entryId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("entry-photos").upload(path, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("entry-photos").getPublicUrl(path);
        // Because the bucket is private, public URL won't work — generate a signed URL for rendering.
        const { data: signed, error: signErr } = await supabase.storage
          .from("entry-photos")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signErr) throw signErr;
        const { error: dbErr } = await supabase.from("entry_photos").insert({
          time_card_entry_id: entryId,
          file_url: signed.signedUrl,
          storage_path: path,
        });
        if (dbErr) throw dbErr;
      }
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => upload(e.target.files)}
        className="hidden"
        id={`photo-${entryId}`}
      />
      <label htmlFor={`photo-${entryId}`} className="btn-secondary inline-block cursor-pointer text-sm">
        {busy ? "Uploading…" : "📷 Add photo"}
      </label>
      {err && <p className="text-red-700 text-xs mt-1">{err}</p>}
    </div>
  );
}
