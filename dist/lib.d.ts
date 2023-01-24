import { PluginEvent } from '@posthog/plugin-scaffold';
import { Logger } from './types';
export declare const PluginLogger: Logger;
export declare const validateApiKey: (apiKey: string) => void;
export declare const getEventsToIgnore: (eventsToIgnore: string) => Set<string>;
export declare const sendEventToOutfunnel: (event: PluginEvent, apiKey: string) => Promise<void>;
