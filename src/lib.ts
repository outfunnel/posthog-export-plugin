import { PluginEvent } from '@posthog/plugin-scaffold'
import { Logger } from './types'
import type { RequestInfo, RequestInit, Response } from 'node-fetch'


const OUTFUNNEL_URL = 'https://d4a6-2001-7d0-831a-a700-15be-d1a5-145f-a6a6.eu.ngrok.io';

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

        const response = await fetch(OUTFUNNEL_URL, {
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
            throw new Error('Error sending event to Outfunnel');
        }
    } catch (error) {
        PluginLogger.error(error)
        throw error
    }

}
