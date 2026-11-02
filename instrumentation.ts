import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (process.env.NODE_ENV !== "production" && !posthogKey) {
  throw new Error(
    "NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured",
  );
}
if (process.env.NODE_ENV !== "production" && !posthogHost) {
  throw new Error(
    "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
  );
}

/**
 * This provider is intentionally not registered globally: only the dedicated
 * PostHog logger below exports records, leaving the app's existing outputs alone.
 */
export const posthogLogProvider = new LoggerProvider({
  resource: resourceFromAttributes({ "service.name": "ghost-guide" }),
  processors:
    posthogKey && posthogHost
      ? [
          new BatchLogRecordProcessor({
            exporter: new OTLPLogExporter({
              url: new URL("/i/v1/logs", posthogHost).toString(),
              headers: {
                Authorization: `Bearer ${posthogKey}`,
                "Content-Type": "application/json",
              },
            }),
          }),
        ]
      : [],
});

/** The only logger connected to the PostHog OTLP exporter in this app. */
export const posthogLog = posthogLogProvider.getLogger("posthog-guide-outcomes");

export function register() {
  // Next.js loads this module during server instrumentation. The logger is used
  // directly rather than installed as the global OTel logger provider.
}
