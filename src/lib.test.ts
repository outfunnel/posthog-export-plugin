import { validateApiKey, getEventsToIgnore, sendEventToOutfunnel } from './lib';


describe('validateApiKey', () => {
    it('throws an error if the API key is empty', () => {
        expect(() => validateApiKey('')).toThrowError('Invalid API key')
    })

    it('does not throw an error if the API key is not empty', () => {
        expect(() => validateApiKey('123')).not.toThrowError('Invalid API key')
    })
})


describe('getEventsToIgnore', () => {
    it('returns a set of events to ignore', () => {
        expect(getEventsToIgnore('event1, event2')).toEqual(new Set(['event1', 'event2']))
    })

    it('returns an empty set if no events are provided', () => {
        expect(getEventsToIgnore('')).toEqual(new Set())
    })
})


// describe('sendEventToOutfunnel', () => {
//     it('sends an event to Outfunnel', async () => {
//         const event = {
//             event: 'test',
//             properties: {
//                 test: 'test'
//             }
//         };
//
//         const apiKey = '12345';
//
//         const response = await sendEventToOutfunnel(event, apiKey);
//
//         expect(sendEventToOutfunnel(event, apiKey)).not.toThrowError('Error sending event to Outfunnel')
//     })
// })
