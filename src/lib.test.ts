import 'isomorphic-fetch';
import { setupServer } from "msw/node";
import { rest } from "msw";
import { createPageview } from '@posthog/plugin-scaffold/test/utils.js';
import { validateApiKey, getEventsToIgnore, sendEventToOutfunnel } from './lib';

const baseUri = 'https://d4a6-2001-7d0-831a-a700-15be-d1a5-145f-a6a6.eu.ngrok.io';

const handlers = [
    // Mock the Outfunnel posthog endpoint
    rest.post(`${baseUri}/posthog`, async (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "data": {},
                "status": 200
            }))
    }),
];

// Setup Outfunnel MSW service
const mswServer = setupServer(...handlers);

beforeAll(() => mswServer.listen());
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());

describe('validateApiKey', () => {
    it('throws an error if the API key is empty', () => {
        expect(() => validateApiKey('')).toThrowError('Invalid API key')
    })

    it('does not throw an error if the API key is not empty', () => {
        expect(() => validateApiKey('123')).not.toThrowError('Invalid API key')
    })
});


describe('getEventsToIgnore', () => {
    it('returns a set of events to ignore', () => {
        expect(getEventsToIgnore('event1, event2')).toEqual(new Set(['event1', 'event2']));
    });

    it('returns an empty set if no events are provided', () => {
        expect(getEventsToIgnore('')).toEqual(new Set());
    });
});


describe('sendEventToOutfunnel',  () => {
    let pageviewEvent: any;
    let apiKey: string;

    beforeEach(() => {
        pageviewEvent = createPageview()
        apiKey = '12345'

    });

    it('sends an event to Outfunnel', async () => {
        await expect(sendEventToOutfunnel(pageviewEvent, apiKey)).resolves.not.toThrowError('Error sending event to Outfunnel')
    });
});
