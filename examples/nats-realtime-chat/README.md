# Realtime chat with Vite, NATS and TRPC

Example with a typesafe React realtime-chat.

Made with tRPC, NATS and Vite.

How to run: 

Using *pnpm*:

`pnpm install`

Start the NATS server with our config: `nats-server -c server.conf` 

Start our mock trpc express back-end: `pnpm start-backend`

Run the react app: `pnpm run dev`

You can now open two browser tabs at `http://localhost:5173` 
and start typing in chat to see them updating in realtime!