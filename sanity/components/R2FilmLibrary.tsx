/**
 * The films already in the R2 bucket, to pick from instead of uploading the
 * same file again. /api/r2/films lists them; picking one only stores its URL
 * in the field, so a film can play in as many places as it is needed.
 */

import { SearchIcon } from "@sanity/icons/Search";
import { Box, Card, Dialog, Flex, Spinner, Stack, Text, TextInput } from "@sanity/ui";
import { useEffect, useState } from "react";
import { useClient, type SanityClient } from "sanity";
import type { R2Video, StoredFilm } from "../../lib/r2";
import { apiVersion } from "../env";

/** Calls one of the site's /api/r2 routes as the signed-in Studio user. */
export async function callR2<T>(
  client: SanityClient,
  path: string,
  { body, signal }: { body?: unknown; signal?: AbortSignal } = {},
) {
  const token = client.config().token;
  if (!token) throw new Error("No Studio session token. Sign out and in again.");
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal,
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export const megabytes = (bytes = 0) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** One film uploaded twice is still one choice: same name, same bytes. */
const filmId = ({ video }: StoredFilm) => `${video.filename}:${video.size}`;

const uploadedOn = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function R2FilmLibrary({
  currentKey,
  onPick,
  onClose,
}: {
  currentKey?: string;
  onPick: (video: R2Video) => void;
  onClose: () => void;
}) {
  const client = useClient({ apiVersion });
  const [films, setFilms] = useState<StoredFilm[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    callR2<{ films: StoredFilm[] }>(client, "/api/r2/films", { signal: abort.signal })
      .then(({ films }) => setFilms(films))
      .catch((e) => abort.signal.aborted || setError(e instanceof Error ? e.message : String(e)));
    return () => abort.abort();
  }, [client]);

  /* Newest first, so the copy kept of each film is its latest upload. */
  const choices = new Map<string, StoredFilm>();
  for (const film of films ?? []) if (!choices.has(filmId(film))) choices.set(filmId(film), film);

  const current = films?.find(({ video }) => video.key === currentKey);
  const needle = query.trim().toLowerCase();
  const shown = [...choices.values()].filter(
    ({ video }) => !needle || video.filename.toLowerCase().includes(needle),
  );

  return (
    <Dialog id="r2-film-library" header="Film library" width={1} onClose={onClose} onClickOutside={onClose}>
      <Box padding={4}>
        <Stack gap={3}>
          <TextInput
            icon={SearchIcon}
            placeholder="Search by filename"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />

          {error ? (
            <Text size={1} style={{ color: "var(--card-badge-critical-fg-color, #c00)" }}>
              {error}
            </Text>
          ) : !films ? (
            <Flex justify="center" padding={4}>
              <Spinner muted />
            </Flex>
          ) : !shown.length ? (
            <Box padding={4}>
              <Text align="center" muted size={1}>
                {films.length ? "No film by that name." : "No films in the bucket yet."}
              </Text>
            </Box>
          ) : (
            <Stack gap={1}>
              {shown.map((film) => (
                <Card
                  key={film.video.key}
                  as="button"
                  type="button"
                  padding={2}
                  radius={2}
                  selected={current !== undefined && filmId(current) === filmId(film)}
                  onClick={() => onPick(film.video)}
                >
                  <Flex align="center" gap={3}>
                    {/* #t nudges Safari to paint the first frame, not a blank box. */}
                    <video
                      src={`${film.video.url}#t=0.1`}
                      muted
                      playsInline
                      preload="metadata"
                      style={{
                        flex: "none",
                        width: 96,
                        aspectRatio: "16 / 9",
                        objectFit: "cover",
                        borderRadius: 2,
                        background: "#000",
                      }}
                    />
                    <Stack flex={1} gap={2}>
                      <Text size={1} weight="medium" textOverflow="ellipsis">
                        {film.video.filename}
                      </Text>
                      <Text muted size={1}>
                        {megabytes(film.video.size)} · {uploadedOn(film.uploaded)}
                      </Text>
                    </Stack>
                  </Flex>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
}
