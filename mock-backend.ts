import { initTRPC, inferAsyncReturnType } from '@trpc/server';
import { z } from 'zod'; 
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import cors from 'cors';

// created for each request
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({}); // no context
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const msgs = ['hello'];

const appRouter = t.router({
    postMessage: t.procedure.input(
        z.object({
            message: z.string()
        })
    )
    .mutation(({ input }) => {
        msgs.push(input.message);

        return input.message;
    }),

    getMessages: t.procedure.query(() => {
        return { msgs };
    })
})

export type AppRouter = typeof appRouter;


const app = express();

app.use(cors());
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(3000, () => console.log('server listening on port 3000'));