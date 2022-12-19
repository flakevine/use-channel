<h1 align="center">
  <!-- <br>
  [Project's Logo] -->
  <br>
  useChannel
  <br>
</h1>

<h4 align="center">Make React-Query realtime for all of your clients with one extra line of code </h4>

<!-- <p align="center">
  [Project's badges]
</p> -->

<p align="center">
  <a href="#about">About</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#faq">FAQ</a> •
  <a href="#roadmap">Roadmap</a> •
  <!-- <a href="#support">Support</a> • -->
  <a href="#license">License</a>
</p>

<!-- ![screenshot](screenshots/1.jpg) -->

## About

Make React-Query realtime for all of your clients with one extra line of code 

## Key Features

- Sync all your clients with the backend's data
  - When data from backend changes, clients are notified and revalidates the current data
- Simple API interface to use
- Simple configuration
- You can achieve type-safety between your client and server by using [trpc's](https://trpc.io/) client functions instead of `fetch` or `axios` on the QueryFn or MutationFn

## Getting Started

> Side note: Currently this library is written in TypeScript and it hasn't been compiled yet, so we only support for TypeScript clients, we are working to fix this issue

For this to work properly, you need a working PubSub solution for syncing events between the client and server, currently we only support [Nats](https://nats.io/), however other systems are going to be implemented on the future.

### Prerequisites

- Node.js with a package manager (npm, yarn or pnpm)
- React with TypeScript
- [Tanstack Query](https://tanstack.com/query/v4) installed on React
- Some PubSub system supported by this lib (nats)

### Installing and Running

First make sure you have React, [Tanstack Query](https://tanstack.com/query/v4) and some supported PubSub system, 

Then install `@flakevine/use-channel` using your prefered package manager.

```bash
# if you use npm
$ npm install @flakevine/use-channel
# if you use yarn
$ yarn add @flakevine/use-channel
# if you use pnpm
$ pnpm install @flakevine/use-channel
```

Use the Context Provider on your app root component:

```tsx
<ChannelContextProvider opts={{ provider: "nats", url: "ws://localhost:4444" }}>
  <App />
<ChannelContextProvider/>
```

Then you can already use our hooks!

<br>

> Client-side code (React with TypeScript and configured [Tanstack Query](https://tanstack.com/query/v4))
```tsx
import { useChannel } from "@flakevine/use-channel";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type BookMutationData = {
  bookName: string;
};

const apiUrl = "http://localhost:3000";

const booksQuery = () => {
  return fetch(apiUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

const booksMutation = (data: BookMutationData) => {
  return fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export default function App() {
  const { channel, mutation, query } = useChannel(
    ["books"],
    booksQuery,
    booksMutation
  );
  const [bookName, setBookName] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ bookName });
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setBookName(event.target.value);
  };

  if (channel.isConnecting || query.isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>useChannel Test</h1>
      {JSON.stringify(query.data)}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={bookName}
          onChange={handleInput}
          placeholder="The name of the book"
        />
        <button type="submit">Create book</button>
      </form>
    </div>
  );
}
```

<br>

> Server-side code (Node.js with TypeScript and Express)
```ts
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const books: string[] = []

app.get('/', (req, res) => {
  res.json(books)
})

app.post('/', (req, res) => {
  const { bookName } = req.body;
  books.push(bookName);
  res.json(books)
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
```

## FAQ

### Is it any good?

[yes.](https://news.ycombinator.com/item?id=3067434)

## Roadmap

- [x] Add this README.
- [ ] Build this and publish it to [npmjs](https://www.npmjs.com/) (add support for JavaScript)
- [ ] Support for Redis

## Emailware

[Project's name] is an [emailware](https://en.wiktionary.org/wiki/emailware). Meaning, if you liked using this app or it has helped you in any way, I'd like you send me an email at <contact.flakevine@gmail.com> about anything you'd want to say about this software. I'd really appreciate it!

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- ## Support

You can also support us by:

<p align="left">
  <a href="https://www.buymeacoffee.com" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a> &nbsp &nbsp
  <a href="https://www.patreon.com">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
  </a>
</p> -->

## License

MIT

<!-- ## Acknowledgments

Inspiration, code snippets, etc.

- [Markdownify's README](https://github.com/amitmerchant1990/electron-markdownify#readme) -->

<!-- ## You may also like...

List of apps or libs that do similar stuff as your project.

- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)
- [Simple README.md template](https://gist.github.com/DomPizzie/7a5ff55ffa9081f2de27c315f5018afc) -->

---

<!-- > [flakevine]() &nbsp;&middot;&nbsp; -->
GitHub [@flakevine](https://github.com/flakevine) <!-- > &nbsp;&middot;&nbsp; -->
<!-- > Twitter [@guilhermehabe](https://twitter.com/guilhermehabe) -->
