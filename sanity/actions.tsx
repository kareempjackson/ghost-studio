/**
 * Unpublish that first takes a document out of every place that shows it.
 *
 * Sanity won't unpublish a document another published one still points to,
 * and a project is pointed to from all over: the Work page's order, the home
 * page's Selected work, the menu's card, a page's featured project, another
 * project's More work, Part of or In depth. So this lists those places, and
 * on confirm takes the document out of each one (published, draft and
 * release copies alike), then unpublishes it as Sanity's own action does.
 *
 * With nothing pointing to it, or inside a release, Sanity's own action runs.
 */

import { Stack, Text } from "@sanity/ui";
import { useToast } from "@sanity/ui/toast";
import { useState } from "react";
import {
  getPublishedId,
  useClient,
  useDocumentOperation,
  useSchema,
  type DocumentActionComponent,
  type SanityClient,
  type SanityDocument,
  type Schema,
} from "sanity";
import { apiVersion } from "./env";

/** A document that points to the one going, and the fields it does it from. */
type Place = { id: string; label: string; fields: string[] };

/** Every path in a value that holds a reference to `id`, as a patch names it. */
function referencesTo(id: string, value: unknown, path = ""): string[] {
  if (Array.isArray(value))
    return value.flatMap((item, i) => {
      const key = (item as { _key?: string } | null)?._key;
      return referencesTo(id, item, `${path}[${key ? `_key=="${key}"` : i}]`);
    });
  if (!value || typeof value !== "object") return [];
  if ((value as { _ref?: string })._ref === id) return [path];
  return Object.entries(value).flatMap(([field, inner]) =>
    field.startsWith("_") ? [] : referencesTo(id, inner, path ? `${path}.${field}` : field),
  );
}

/** Every copy of every document that points to `id`: published, draft and in a release. */
const pointingTo = (client: SanityClient, id: string) =>
  client.fetch<SanityDocument[]>(`*[references($id)]`, { id }, { perspective: "raw" });

/** The copies as an editor knows them: one row a document, by its name and its fields' titles. */
function placesOf(docs: SanityDocument[], id: string, schema: Schema): Place[] {
  const places = new Map<string, Place>();
  for (const doc of docs) {
    const type = schema.get(doc._type);
    const key = getPublishedId(doc._id);
    const place = places.get(key) ?? {
      id: key,
      label: typeof doc.name === "string" ? doc.name : (type?.title ?? doc._type),
      fields: [],
    };
    for (const path of referencesTo(id, doc)) {
      const name = path.split(/[.[]/)[0];
      const field = type && "fields" in type ? type.fields.find((f) => f.name === name) : undefined;
      const title = field?.type.title ?? name;
      if (!place.fields.includes(title)) place.fields.push(title);
    }
    places.set(key, place);
  }
  return [...places.values()];
}

/* One wrapper per action, so the Studio keeps the same component, and its
   open dialog, however often it asks for the actions. */
const wrapped = new WeakMap<DocumentActionComponent, DocumentActionComponent>();

export function unpublishEverywhere(Unpublish: DocumentActionComponent): DocumentActionComponent {
  const known = wrapped.get(Unpublish);
  if (known) return known;

  const Action: DocumentActionComponent = (props) => {
    const original = Unpublish(props);
    const client = useClient({ apiVersion });
    const schema = useSchema();
    const toast = useToast();
    const { unpublish } = useDocumentOperation(props.id, props.type);
    const [places, setPlaces] = useState<Place[] | null>(null);

    if (!original?.onHandle || props.release) return original;
    const ownAction = original.onHandle;
    const name = (props.draft ?? props.published)?.name;
    const title = typeof name === "string" ? `“${name}”` : "It";

    const handle = async () => {
      try {
        const found = placesOf(await pointingTo(client, props.id), props.id, schema);
        if (found.length) setPlaces(found);
        else ownAction();
      } catch (error) {
        toast.push({ status: "error", title: "Could not look for the places that show it", description: String(error) });
      }
    };

    /* Looked up again, in case anything has started pointing to it since. */
    const confirm = async () => {
      setPlaces(null);
      try {
        const docs = await pointingTo(client, props.id);
        const tx = client.transaction();
        for (const doc of docs) tx.patch(doc._id, { unset: referencesTo(props.id, doc) });
        await tx.commit();
      } catch (error) {
        toast.push({ status: "error", title: "Could not take it out of the places that show it", description: String(error) });
        return;
      }
      unpublish.execute();
    };

    return {
      ...original,
      onHandle: handle,
      dialog: places
        ? {
            type: "confirm",
            tone: "critical",
            confirmButtonText: "Unpublish and take it out",
            message: (
              <Stack gap={4}>
                <Text>{title} comes off the site, and out of every place that shows it:</Text>
                <Stack gap={3}>
                  {places.map((place) => (
                    <Text key={place.id} size={1}>
                      <strong>{place.label}</strong> — {place.fields.join(", ")}
                    </Text>
                  ))}
                </Stack>
                <Text size={1} muted>
                  Those change now, on the site too. Publishing it again later won&apos;t put it back in them.
                </Text>
              </Stack>
            ),
            onCancel: () => setPlaces(null),
            onConfirm: confirm,
          }
        : original.dialog,
    };
  };
  Action.action = Unpublish.action;
  Action.displayName = "UnpublishEverywhereAction";
  wrapped.set(Unpublish, Action);
  return Action;
}
