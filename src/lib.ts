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
