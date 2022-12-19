import { useState } from 'react'
import './App.css'
import { trpc } from './trpc';
import { useChannel } from '@flakevine/use-channel';

const fetchMessages = async () => {
  return await trpc.getMessages.query();
}

const postMessage = async ({ message }: { message: string }) => {
  return await trpc.postMessage.mutate({ message });
}

function App() {
  const [message, setMessage] = useState<string>('');
  const messages = useChannel(['chat'], fetchMessages, postMessage);

  if (messages.channel.isConnecting || messages.query.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {messages.query.data?.msgs.map((m, idx) => {
        return <p key={idx}>{m}</p>
      })}
      <input type="text" onChange={(e) => setMessage(e.target.value)} value={message} />
      <button onClick={() => {
        messages.mutation.mutate({ message });
      }}>send</button>
    </div>
  )
}

export default App;