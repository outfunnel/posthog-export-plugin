import { Meta } from '@posthog/plugin-scaffold'

export type PluginConfig = {
    outfunnelApiKey: string
    uploadMinutes: string
    uploadMegabytes: string
    eventsToIgnore: string
    uploadFormat: 'jsonl'
}

export interface OutfunnelPluginMeta extends Meta {
    global: {
        eventsToIgnore: Set<string>
    }
    config: PluginConfig
}
