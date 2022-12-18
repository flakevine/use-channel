import { useState } from 'react'
import './App.css'
import { trpc } from './trpc';
import { useRealtimeChannel } from './useChannel';

const fetchMessages = async () => {
  return await trpc.getMessages.query();
}

const postMessage = async ({ message }: { message: string }) => {
  return await trpc.postMessage.mutate({ message });
}

function App() {
  const [message, setMessage] = useState<string>('');
  const messages = useRealtimeChannel(['chat'], fetchMessages, postMessage);

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