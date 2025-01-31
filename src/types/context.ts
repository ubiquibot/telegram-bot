import { Octokit } from "@octokit/rest";
import { EmitterWebhookEvent as WebhookEvent, EmitterWebhookEventName as WebhookEventName } from "@octokit/webhooks";
import { Env } from "./env";
import { PluginSettings } from "./plugin-inputs";
import { Logs } from "@ubiquity-os/ubiquity-os-logger";
import { createAdapters } from "../adapters";
import { Octokit as RestOctokitFromApp } from "octokit";

export type SupportedEventsU = WebhookEventName;

export type SupportedEvents = {
  [K in SupportedEventsU]: K extends WebhookEventName ? WebhookEvent<K> : never;
};

export interface Context<T extends SupportedEventsU = SupportedEventsU, TU extends SupportedEvents[T] = SupportedEvents[T]> {
  eventName: T;
  payload: TU["payload"];
  octokit: Octokit | RestOctokitFromApp;
  config: PluginSettings;
  env: Env;
  logger: Logs;
  adapters: ReturnType<typeof createAdapters>;
}
