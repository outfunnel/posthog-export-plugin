import { setupPlugin } from './index';
import { PluginConfig } from './types';

const defaultConfig: PluginConfig = {
    "outfunnelApiKey": "12345",
    "uploadMinutes": "1",
    "uploadMegabytes": "1",
    "eventsToIgnore": "one,two,three",
    "uploadFormat": 'jsonl'
}

const invalidConfig: PluginConfig = {
    "outfunnelApiKey": null,
    "uploadMinutes": null,
    "uploadMegabytes": null,
    "eventsToIgnore": "one,two,three",
    "uploadFormat": 'jsonl'
}


describe('Outfunnel Plugin', () => {
    let mockedMeta: any
    let mockedInvalidMeta: any

    beforeEach(() => {
        jest.clearAllMocks()

        console.log = jest.fn()
        console.error = jest.fn()
        console.debug = jest.fn()

        mockedMeta = {
            global: {},
            config: defaultConfig
        }

        mockedInvalidMeta = {
            global: {},
            config: invalidConfig
        }
    })


    describe('setupPlugin', () => {
        it('throws an error if the API key is not provided', () => {
            expect(() => setupPlugin(mockedInvalidMeta)).toThrowError('Please provide an API key')
        })

        it('does not throw an error if the API key is provided', () => {
            expect(() => setupPlugin(mockedMeta)).not.toThrowError('Please provide an API key')
        })

        it('Sets up plugin correctly' , () => {
            setupPlugin(mockedMeta)
            expect(mockedMeta.global.eventsToIgnore).toEqual(new Set(['one', 'two', 'three']))
        })
    });

});

