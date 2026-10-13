import { Card, Empty, Pill } from "../../_components/ui";

/**
 * A page that isn't there, or isn't this person's to see. The two read the
 * same on purpose: a client never learns what another client's link holds.
 */
export default function PortalNotFound() {
  return (
    <Card className="mt-4">
      <Empty
        title="Nothing here, or nothing shared with you."
        body="The link may be old, or the work may not have been sent your way yet."
      >
        <Pill tone="ink" href="/portal">
          Back to home
        </Pill>
      </Empty>
    </Card>
  );
}
