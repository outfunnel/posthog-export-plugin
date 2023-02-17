import { PluginEvent, RetryError } from '@posthog/plugin-scaffold'
import ObjectId from 'bson-objectid';
import { Logger, RequestInfo, RequestInit, Response } from './types'
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

export const validateUserId = (userId: string): void => {
    if (!userId || !ObjectId.isValid(userId)) {
        throw new Error('Invalid Outfunnel user ID');
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

export const sendEventToOutfunnel = async (event: PluginEvent, userId: string): Promise<void> => {

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
