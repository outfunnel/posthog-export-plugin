import 'isomorphic-fetch';
import { setupServer } from "msw/node";
import { createPageview } from '@posthog/plugin-scaffold/test/utils.js';
import { validateUserId, getEventsToIgnore, sendEventToOutfunnel } from './lib';
import { handlers, setupFailedApiHandler, setupUnauthorizedApiHandler} from './test.utils';

// Setup Outfunnel MSW service
const mswServer = setupServer(...handlers);

beforeAll(() => mswServer.listen());
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());

describe('validateUserId', () => {
    it('throws an error if the User id is empty', () => {
        expect(() => validateUserId('')).toThrowError('Invalid Outfunnel user ID')
    })

    it('does not throw an error if the User ID is valid', () => {
        expect(() => validateUserId('56cb91bdc3464f14678934ca')).not.toThrowError('Invalid Outfunnel user ID')
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
    let userId: string;

    beforeEach(() => {
        pageviewEvent = createPageview()
        userId = '56cb91bdc3464f14678934ca'
    });

    it('sends an event to Outfunnel', async () => {
        await expect(sendEventToOutfunnel(pageviewEvent, userId)).resolves.not.toThrowError('Error sending event to Outfunnel')
    });

    it('throws an error if there is a network problem', async () => {
        setupFailedApiHandler(mswServer);
        await expect(sendEventToOutfunnel(pageviewEvent, userId)).rejects.toThrowError('Failed to connect')
    });

    it('throws an error if the User ID is not authorized', async () => {
        setupUnauthorizedApiHandler(mswServer);
        await expect(sendEventToOutfunnel(pageviewEvent, userId)).rejects.toThrowError('Error sending event to Outfunnel')
    });
});
