import { PluginEvent, RetryError } from '@posthog/plugin-scaffold'
import type { RequestInfo, RequestInit, Response } from 'node-fetch'
import { Logger } from './types'
import { OUTFUNNEL_URL } from './constants'

export const PluginLogger: Logger = {
    info: console.info,
    error: console.error,
    debug: console.debug,
    warn: console.warn,
    log: console.log
};

// fetch only declared, as it's provided as a plugin VM global
declare function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>

export const validateApiKey = (apiKey: string): void => {
    if (!apiKey) {
        throw new Error('Invalid API key')
    }
}

export const getEventsToIgnore = (eventsToIgnore: string): Set<string> => {
    if (!eventsToIgnore) {
        return new Set()
    }

    return new Set(eventsToIgnore.split(',').map((event) => event.trim()))
}

async function statusOk(res: Response): Promise<boolean> {
    PluginLogger.debug('testing response for whether it is "ok". has status: ', res.status, ' debug: ', JSON.stringify(res))
    return String(res.status)[0] === '2'
}

export const sendEventToOutfunnel = async (event: PluginEvent, apiKey: string): Promise<void> => {

    try {
        PluginLogger.debug('Sending event to Outfunnel', event)

        const response = await fetch(`${OUTFUNNEL_URL}/posthog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(event)
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
