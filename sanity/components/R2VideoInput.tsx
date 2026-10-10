/**
 * The input for a film. It looks like Sanity's file input, but the file goes
 * to R2: the Studio asks /api/r2/upload for a signed URL, PUTs the file
 * straight to the bucket, and stores what it was and where it plays from.
 *
 * A film already in the bucket is picked from the library instead
 * (R2FilmLibrary.tsx). Uploading one that is already there, by name and
 * size, skips the upload and uses that copy.
 *
 * Removing a film only clears the field. The object stays in the bucket,
 * since an earlier revision of the document may still point at it.
 */

import { FolderIcon } from "@sanity/icons/Folder";
import { TrashIcon } from "@sanity/icons/Trash";
import { UploadIcon } from "@sanity/icons/Upload";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useCallback, useRef, useState, type DragEvent } from "react";
import { set, unset, useClient, type ObjectInputProps } from "sanity";
import type { R2Video } from "../../lib/r2";
import { apiVersion } from "../env";
import { callR2, megabytes, R2FilmLibrary } from "./R2FilmLibrary";

const ACCEPT = "video/mp4";

type R2VideoValue = {
  _type?: "r2Video";
  url?: string;
  key?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
};

type Ticket = { key: string; url: string; uploadUrl: string; headers: Record<string, string> };

/** The same file is already in the bucket: use that copy instead. */
type Existing = { existing: R2Video };

/** fetch cannot report upload progress, so the PUT goes by XHR. */
function putFile(ticket: Ticket, file: File, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticket.uploadUrl);
    for (const [name, value] of Object.entries(ticket.headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status < 300 ? resolve() : reject(new Error(`R2 refused the upload (${xhr.status})`));
    xhr.onerror = () => reject(new Error("The upload failed. Is CORS set on the bucket?"));
    xhr.send(file);
  });
}

export function R2VideoInput({ value, onChange, readOnly }: ObjectInputProps<R2VideoValue>) {
  const client = useClient({ apiVersion });
  const picker = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [browsing, setBrowsing] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setNotice(null);
      if (file.type !== ACCEPT) {
        setError("Films must be MP4.");
        return;
      }
      setError(null);
      setProgress(0);
      try {
        const ticket = await callR2<Ticket | Existing>(client, "/api/r2/upload", {
          body: { filename: file.name, contentType: file.type, size: file.size },
        });
        if ("existing" in ticket) {
          onChange(set(ticket.existing));
          setNotice(`${file.name} is already in the library, so this uses that copy.`);
          return;
        }
        await putFile(ticket, file, setProgress);
        onChange(
          set({
            _type: "r2Video",
            url: ticket.url,
            key: ticket.key,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setProgress(null);
      }
    },
    [client, onChange],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && !readOnly) void upload(file);
  };

  const pick = (video: R2Video) => {
    setBrowsing(false);
    setError(null);
    setNotice(null);
    onChange(set(video));
  };

  const busy = progress !== null;

  return (
    <Stack gap={3}>
      <input
        ref={picker}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (file) void upload(file);
        }}
      />

      <Card
        border
        radius={2}
        padding={value?.url ? 0 : 4}
        tone={error ? "critical" : "default"}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        overflow="hidden"
      >
        {value?.url ? (
          <video
            key={value.url}
            src={value.url}
            controls
            muted
            playsInline
            preload="metadata"
            style={{ display: "block", width: "100%", maxHeight: 360, background: "#000" }}
          />
        ) : (
          <Text align="center" muted size={1}>
            {busy ? `Uploading… ${Math.round(progress * 100)}%` : "Drop an MP4 here, or choose one from the library."}
          </Text>
        )}
      </Card>

      {value?.url && (
        <Text muted size={1}>
          {value.filename} · {megabytes(value.size)}
          {busy && ` · replacing… ${Math.round(progress * 100)}%`}
        </Text>
      )}

      {notice && (
        <Text muted size={1}>
          {notice}
        </Text>
      )}

      {error && (
        <Text size={1} style={{ color: "var(--card-badge-critical-fg-color, #c00)" }}>
          {error}
        </Text>
      )}

      <Flex gap={2} wrap="wrap">
        <Button
          icon={UploadIcon}
          mode="ghost"
          text={value?.url ? "Replace" : "Upload"}
          disabled={readOnly || busy}
          loading={busy}
          onClick={() => picker.current?.click()}
        />
        <Button
          icon={FolderIcon}
          mode="ghost"
          text="Choose from library"
          disabled={readOnly || busy}
          onClick={() => setBrowsing(true)}
        />
        {value?.url && (
          <Button
            icon={TrashIcon}
            mode="ghost"
            tone="critical"
            text="Remove"
            disabled={readOnly || busy}
            onClick={() => onChange(unset())}
          />
        )}
      </Flex>

      {browsing && (
        <R2FilmLibrary currentKey={value?.key} onPick={pick} onClose={() => setBrowsing(false)} />
      )}
    </Stack>
  );
}
