import { rest } from 'msw'
import { OUTFUNNEL_URL } from './constants'

export const handlers = [
    // Mock the Outfunnel posthog endpoint
    rest.post(`${OUTFUNNEL_URL}/events/posthog`, async (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "data": {},
                "status": 200
            }))
    }),
];


export const setupFailedApiHandler = (mswServer) => {
    mswServer.use(
        rest.post(`${OUTFUNNEL_URL}/events/posthog`, async (req, res, ctx) => {
            return res.networkError('Failed to connect');
        }),
    );
};

export const setupUnauthorizedApiHandler = (mswServer) => {
    mswServer.use(
        rest.post(`${OUTFUNNEL_URL}/events/posthog`, async (req, res, ctx) => {
            return res(
                ctx.status(401),
                ctx.json({
                    "data": {},
                    "status": 401
                }))
        }),
    );
};
