import { PluginEvent } from '@posthog/plugin-scaffold'
import { OutfunnelPluginMeta } from './types'
import { validateApiKey, getEventsToIgnore } from './lib'

export const setupPlugin = (meta: OutfunnelPluginMeta) => {
    const { global, config } = meta

    if (!config.outfunnelApiKey) {
        throw new Error('Please provide an API key')
    }

    validateApiKey(config.outfunnelApiKey)


    global.eventsToIgnore = config.eventsToIgnore ? getEventsToIgnore(config.eventsToIgnore) : null
}


export const exportEvents = (events: PluginEvent[], meta: OutfunnelPluginMeta) => {

}
