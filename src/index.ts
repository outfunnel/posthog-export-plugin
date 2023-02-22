import { Meta, PluginEvent, RetryError } from '@posthog/plugin-scaffold';

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


const PluginLogger: Logger = {
    info: console.info,
    error: console.error,
    debug: console.debug,
    warn: console.warn,
    log: console.log
};

// fetch only declared, as it's provided as a plugin VM global
declare function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>

const validateUserId = (userId: string): void => {
    if (!userId) {
        throw new Error('Invalid Outfunnel user ID');
    }
}

const getEventsToIgnore = (eventsToIgnore: string): Set<string> => {
    if (!eventsToIgnore) {
        return new Set()
    }

    return new Set(eventsToIgnore.split(',').map((event) => event.trim()))
}

async function statusOk(res: Response): Promise<boolean> {
    PluginLogger.debug('testing response for whether it is "ok". has status: ', res.status, ' debug: ', JSON.stringify(res))
    return String(res.status)[0] === '2'
}

const sendEventToOutfunnel = async (event: PluginEvent, userId: string): Promise<void> => {

    try {
        PluginLogger.debug('Sending event to Outfunnel', event)

        const requestBody = {
            event
        }

        const response = await fetch(`${OUTFUNNEL_URL}/events/posthog/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const isOkResponse = await statusOk(response)

        if (!isOkResponse) {
            PluginLogger.error('Error sending event to Outfunnel', JSON.stringify(response));
            throw new RetryError('Error sending event to Outfunnel');
        }
    } catch (error) {
        PluginLogger.error(error)
        throw error
    }

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
