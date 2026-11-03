import { Button, Card, Flex, Stack, Text, TextArea, TextInput } from "@sanity/ui";
import { useState } from "react";
import { set, unset, type StringInputProps } from "sanity";

/**
 * A key's field. Once saved, the key is never shown again, only what it is
 * (`summarize`), with Replace and Remove; a new one is pasted into an empty
 * box and kept with Use this key. Anyone who can open the document could
 * still read it in its JSON, but not over an editor's shoulder.
 */
export function secretInput(summarize: (value: string) => string, { multiline = false } = {}) {
  return function SecretInput({ value, onChange, readOnly, elementProps }: StringInputProps) {
    const [replacing, setReplacing] = useState(false);
    const [draft, setDraft] = useState("");

    if (value && !replacing) {
      return (
        <Card padding={3} radius={2} border tone="positive">
          <Flex align="center" gap={2}>
            <Stack flex={1} gap={2}>
              <Text size={1} weight="medium">
                Saved
              </Text>
              <Text size={1} muted>
                {summarize(value)}
              </Text>
            </Stack>
            {!readOnly && (
              <>
                <Button text="Replace" mode="ghost" onClick={() => setReplacing(true)} />
                <Button text="Remove" mode="ghost" tone="critical" onClick={() => onChange(unset())} />
              </>
            )}
          </Flex>
        </Card>
      );
    }

    const keep = () => {
      const next = draft.trim();
      onChange(next ? set(next) : unset());
      setDraft("");
      setReplacing(false);
    };
    const box = {
      id: elementProps.id,
      onFocus: elementProps.onFocus,
      onBlur: elementProps.onBlur,
      readOnly,
      value: draft,
      autoComplete: "off",
      spellCheck: false,
    };
    return (
      <Stack gap={2}>
        {multiline ? (
          <TextArea {...box} rows={6} onChange={(event) => setDraft(event.currentTarget.value)} />
        ) : (
          <TextInput {...box} onChange={(event) => setDraft(event.currentTarget.value)} />
        )}
        <Flex gap={2}>
          <Button text="Use this key" tone="primary" disabled={readOnly || !draft.trim()} onClick={keep} />
          {replacing && (
            <Button
              text="Cancel"
              mode="ghost"
              onClick={() => {
                setDraft("");
                setReplacing(false);
              }}
            />
          )}
        </Flex>
      </Stack>
    );
  };
}
