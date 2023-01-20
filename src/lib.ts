import { PluginEvent } from '@posthog/plugin-scaffold'
import { Logger } from './types'


const OUTFUNNEL_URL = 'https://push.outfunnel.com/posthog';

export const PluginLogger: Logger = {
    info: console.info,
    error: console.error,
    debug: console.debug,
    warn: console.warn,
    log: console.log
};

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

        if (!response.ok) {
            PluginLogger.error('Error sending event to Outfunnel', response);
            throw new Error('Error sending event to Outfunnel');
        }
    } catch (error) {
        PluginLogger.error(error)
    }

}
