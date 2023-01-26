import { PluginEvent } from '@posthog/plugin-scaffold';
import { Logger } from './types';
export declare const PluginLogger: Logger;
export declare const validateUserId: (userId: string) => void;
export declare const getEventsToIgnore: (eventsToIgnore: string) => Set<string>;
export declare const sendEventToOutfunnel: (event: PluginEvent, userId: string) => Promise<void>;
