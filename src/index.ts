import { Meta, PluginEvent } from '@posthog/plugin-scaffold'
import { validateUserId, getEventsToIgnore, sendEventToOutfunnel, PluginLogger } from './lib';

const OUTFUNNEL_URL = 'https://sink.outfunnel.com';

type PluginConfig = {
    outfunnelUserId: string
    eventsToIgnore: string
}

interface OutfunnelPluginMeta extends Meta {
    global: {
        eventsToIgnore: Set<string>
    }
    config: PluginConfig
}

interface Logger {
    error: typeof console.error
    log: typeof console.log
    debug: typeof console.debug,
    warn: typeof console.warn
    info: typeof console.info
}

type RequestInfo = string | Request;

type RequestInit = {
    method?: string
    headers?: Record<string, string>
    body?: string
}

interface Response {
    status: number | string
}


export const setupPlugin = (meta: OutfunnelPluginMeta) => {
    const { global, config } = meta;

    if (!config.outfunnelUserId) {
        throw new Error('Please provide a valid Outfunnel user ID');
    }

    validateUserId(config.outfunnelUserId);

    global.eventsToIgnore = config.eventsToIgnore ? getEventsToIgnore(config.eventsToIgnore) : null;
}


export const onEvent = async (event: PluginEvent, meta: OutfunnelPluginMeta) => {
    const { global, config } = meta;

    if (global.eventsToIgnore && global.eventsToIgnore.has(event.event)) {
        return;
    }

    if (!config.outfunnelUserId) {
        throw new Error('Please provide a valid Outfunnel user ID');
    }

    try {
        await sendEventToOutfunnel(event, config.outfunnelUserId)
    } catch (error) {
        PluginLogger.error(error);
        throw new Error(`Failed to send event to Outfunnel Error: ${error}`);
    }
}
