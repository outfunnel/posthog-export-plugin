'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var dist = {};

var errors = {};

Object.defineProperty(errors, "__esModule", { value: true });
errors.RetryError = void 0;
class RetryError extends Error {
    _attempt;
    _maxAttempts;
    constructor(message) {
        super(message);
        this.name = "RetryError";
    }
    get nameWithAttempts() {
        return this._attempt && this._maxAttempts ? `${this.name} (attempt ${this._attempt}/${this._maxAttempts})` : this.name;
    }
    toString() {
        return this.message ? `${this.nameWithAttempts}: ${this.message}` : this.nameWithAttempts;
    }
}
errors.RetryError = RetryError;

var types = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MetricsOperation = void 0;
	(function (MetricsOperation) {
	    MetricsOperation["Sum"] = "sum";
	    MetricsOperation["Min"] = "min";
	    MetricsOperation["Max"] = "max";
	})(exports.MetricsOperation || (exports.MetricsOperation = {}));
	
} (types));

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(errors, exports);
	__exportStar(types, exports);
	
} (dist));

const OUTFUNNEL_URL = 'https://sink.outfunnel.com';

const PluginLogger = {
    info: console.info,
    error: console.error,
    debug: console.debug,
    warn: console.warn,
    log: console.log
};
const validateUserId = (userId) => {
    if (!userId) {
        throw new Error('Invalid Outfunnel user ID');
    }
};
const getEventsToIgnore = (eventsToIgnore) => {
    if (!eventsToIgnore) {
        return new Set();
    }
    return new Set(eventsToIgnore.split(',').map((event) => event.trim()));
};
function statusOk(res) {
    return __awaiter(this, void 0, void 0, function* () {
        PluginLogger.debug('testing response for whether it is "ok". has status: ', res.status, ' debug: ', JSON.stringify(res));
        return String(res.status)[0] === '2';
    });
}
const sendEventToOutfunnel = (event, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        PluginLogger.debug('Sending event to Outfunnel', event);
        const requestBody = {
            event
        };
        const response = yield fetch(`${OUTFUNNEL_URL}/events/posthog/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        const isOkResponse = yield statusOk(response);
        if (!isOkResponse) {
            PluginLogger.error('Error sending event to Outfunnel', JSON.stringify(response));
            throw new dist.RetryError('Error sending event to Outfunnel');
        }
    }
    catch (error) {
        PluginLogger.error(error);
        throw error;
    }
});

const setupPlugin = (meta) => {
    const { global, config } = meta;
    if (!config.outfunnelUserId) {
        throw new Error('Please provide a valid Outfunnel user ID');
    }
    validateUserId(config.outfunnelUserId);
    global.eventsToIgnore = config.eventsToIgnore ? getEventsToIgnore(config.eventsToIgnore) : null;
};
const onEvent = (event, meta) => __awaiter(void 0, void 0, void 0, function* () {
    const { global, config } = meta;
    if (global.eventsToIgnore && global.eventsToIgnore.has(event.event)) {
        PluginLogger.info(`Ignoring event ${event.event}`);
        return;
    }
    if (!config.outfunnelUserId) {
        throw new Error('Please provide a valid Outfunnel user ID');
    }
    try {
        yield sendEventToOutfunnel(event, config.outfunnelUserId);
    }
    catch (error) {
        PluginLogger.error(error);
        throw new Error(`Failed to send event to Outfunnel Error: ${error}`);
    }
});

exports.onEvent = onEvent;
exports.setupPlugin = setupPlugin;
