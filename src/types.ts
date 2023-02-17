import { Meta } from '@posthog/plugin-scaffold'

export type PluginConfig = {
    outfunnelUserId: string
    eventsToIgnore: string
}

export interface OutfunnelPluginMeta extends Meta {
    global: {
        eventsToIgnore: Set<string>
    }
    config: PluginConfig
}

export interface Logger {
    error: typeof console.error
    log: typeof console.log
    debug: typeof console.debug,
    warn: typeof console.warn
    info: typeof console.info
}

export type RequestInfo = string | Request;

export type RequestInit = {
    method?: string
    headers?: Record<string, string>
    body?: string
}

export interface Response {
    status: number | string
}
