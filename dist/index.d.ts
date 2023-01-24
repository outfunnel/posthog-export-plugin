import { PluginEvent } from '@posthog/plugin-scaffold';
import { OutfunnelPluginMeta } from './types';
export declare const setupPlugin: (meta: OutfunnelPluginMeta) => void;
export declare const onEvent: (event: PluginEvent, meta: OutfunnelPluginMeta) => Promise<void>;
