import { setupPlugin } from './index';
import { PluginConfig } from './types';

const defaultConfig: PluginConfig = {
    "outfunnelApiKey": "12345",
    "eventsToIgnore": "one,two,three",
}

const invalidConfig: PluginConfig = {
    "outfunnelApiKey": null,
    "eventsToIgnore": "one,two,three",
}


describe('Outfunnel Plugin', () => {
    let mockedMeta: any
    let mockedInvalidConfigMeta: any

    beforeEach(() => {
        jest.clearAllMocks()

        console.log = jest.fn()
        console.error = jest.fn()
        console.debug = jest.fn()

        mockedMeta = {
            global: {},
            config: defaultConfig
        }

        mockedInvalidConfigMeta = {
            global: {},
            config: invalidConfig
        }
    })


    describe('setupPlugin', () => {
        it('throws an error if the API key is not provided', () => {
            expect(() => setupPlugin(mockedInvalidConfigMeta)).toThrowError('Please provide an API key')
        })

        it('does not throw an error if the API key is provided', () => {
            expect(() => setupPlugin(mockedMeta)).not.toThrowError('Please provide an API key')
        })

        it('Sets up plugin correctly' , () => {
            setupPlugin(mockedMeta)
            expect(mockedMeta.global.eventsToIgnore).toBeDefined()
            expect(mockedMeta.global.eventsToIgnore).toEqual(new Set(['one', 'two', 'three']))
        })
    });

});

