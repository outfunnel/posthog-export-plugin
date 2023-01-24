import { PluginEvent } from '@posthog/plugin-scaffold'
import { OutfunnelPluginMeta } from './types'
import { validateApiKey, getEventsToIgnore, sendEventToOutfunnel, PluginLogger } from './lib'

export const setupPlugin = (meta: OutfunnelPluginMeta) => {
    const { global, config } = meta

    if (!config.outfunnelApiKey) {
        throw new Error('Please provide an API key')
    }

    validateApiKey(config.outfunnelApiKey)

    global.eventsToIgnore = config.eventsToIgnore ? getEventsToIgnore(config.eventsToIgnore) : null
}


export const onEvent = async (event: PluginEvent, meta: OutfunnelPluginMeta) => {
    const { global, config } = meta

    if (global.eventsToIgnore && global.eventsToIgnore.has(event.event)) {
        PluginLogger.info(`Ignoring event ${event.event}`)
        return
    }

    if (!config.outfunnelApiKey) {
        throw new Error('Please provide an API key')
    }

    try {
        await sendEventToOutfunnel(event, config.outfunnelApiKey)
    } catch (error) {
        PluginLogger.error(error)
        throw new Error(`Failed to send event to Outfunnel Error: ${error}`)
    }
}
