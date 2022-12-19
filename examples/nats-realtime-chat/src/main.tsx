import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ChannelContextProvider } from '@flakevine/use-channel';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <ChannelContextProvider opts={{provider: 'nats', url: 'ws://localhost:4444'}}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </ChannelContextProvider>
  </QueryClientProvider>
)
