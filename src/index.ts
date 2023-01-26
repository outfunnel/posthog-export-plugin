import { PluginEvent } from '@posthog/plugin-scaffold';
import { OutfunnelPluginMeta } from './types';
import { validateUserId, getEventsToIgnore, sendEventToOutfunnel, PluginLogger } from './lib';

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
        PluginLogger.info(`Ignoring event ${event.event}`);
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
