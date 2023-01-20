import { PluginMeta } from '@posthog/plugin-scaffold'

export type PluginConfig = {
    outfunnelApiKey: string
    uploadMinutes: string
    uploadMegabytes: string
    eventsToIgnore: string
    uploadFormat: 'jsonl'
}

export type OutfunnelPluginMeta = PluginMeta<{
    global: {
        eventsToIgnore: Set<string>
    }
    config: PluginConfig
}>
