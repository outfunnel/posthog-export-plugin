import 'isomorphic-fetch';
import { PluginEvent } from '@posthog/plugin-scaffold'
import { createPageview } from '@posthog/plugin-scaffold/test/utils.js';
import { setupServer } from 'msw/node'
import { setupPlugin, onEvent } from './index';
import { PluginConfig } from './types';
import { handlers, setupFailedApiHandler, setupUnauthorizedApiHandler } from './test.utils'

const defaultConfig: PluginConfig = {
    "outfunnelUserId": "56cb91bdc3464f14678934ca",
    "eventsToIgnore": "one,two,three"
}

const invalidConfig: PluginConfig = {
    "outfunnelUserId": null,
    "eventsToIgnore": "one,two,three"
}

const eventsToIgnoreConfig: PluginConfig = {
    "outfunnelUserId": "56cb91bdc3464f14678934ca",
    "eventsToIgnore": "$pageview"
}

// Setup Outfunnel MSW service
const mswServer = setupServer(...handlers);

beforeAll(() => mswServer.listen());
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());

describe('Outfunnel Plugin', () => {
    let mockedMeta: any;
    let mockedInvalidConfigMeta: any;
    let mockedEventsToIgnoreMeta: any;
    let pageviewEvent: PluginEvent;

    beforeEach(() => {
        jest.clearAllMocks()

        console.info = jest.fn();

        mockedMeta = {
            global: {},
            config: defaultConfig
        };

        mockedInvalidConfigMeta = {
            global: {},
            config: invalidConfig
        };

        mockedEventsToIgnoreMeta = {
            global: {},
            config: eventsToIgnoreConfig
        };

        pageviewEvent = createPageview();

    })


    describe('setupPlugin', () => {
        it('throws an error if the User ID is not provided', () => {
            expect(() => setupPlugin(mockedInvalidConfigMeta)).toThrowError('Please provide a valid Outfunnel user ID')
        })

        it('does not throw an error if the User ID is provided', () => {
            expect(() => setupPlugin(mockedMeta)).not.toThrowError('Please provide a valid Outfunnel user ID')
        })

        it('Sets up plugin correctly' , () => {
            setupPlugin(mockedMeta)
            expect(mockedMeta.global.eventsToIgnore).toBeDefined()
            expect(mockedMeta.global.eventsToIgnore).toEqual(new Set(['one', 'two', 'three']))
        })
    });


    describe('onEvent', () => {
        it('sends an event to Outfunnel', async () => {
            await expect(onEvent(pageviewEvent, mockedMeta)).resolves.not.toThrowError('Error sending event to Outfunnel');
        });

        it('throws an error if there is a network problem', async () => {
            setupFailedApiHandler(mswServer);
            await expect(onEvent(pageviewEvent, mockedMeta)).rejects.toThrowError('Failed to connect');
        });

        it('throws an error if the User ID is invalid', async () => {
            setupUnauthorizedApiHandler(mswServer);
            await expect(onEvent(pageviewEvent, mockedMeta)).rejects.toThrowError('Error sending event to Outfunnel');
        });

        it('throws an error if the User ID is not provided', async () => {
            await expect(onEvent(pageviewEvent, mockedInvalidConfigMeta)).rejects.toThrowError('Please provide a valid Outfunnel user ID');
        });
    });

});

