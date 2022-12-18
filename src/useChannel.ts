import { MutationFunction, QueryFunction, QueryKey, useMutation, UseMutationOptions, UseMutationResult, useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { connect, NatsConnection, NatsError, StringCodec, Subscription } from 'nats.ws';
import React, { useCallback, useEffect, useState } from 'react'

const sc = StringCodec();

export const useChannel = (channel: string, onMessage: (err: NatsError | null, msg: string) => void) => {
  const [nc, setConnection] = useState<NatsConnection>();
  const [sub, setSubscription] = useState<Subscription>();
  const [isConnecting, setIsConnecting] = useState<boolean>(true);

  useEffect(() => {
    connect({ servers: ['ws://localhost:4444'] })
    .then(connection => {
      setConnection(connection);
    })
  }, []);

  useEffect(() => {
    if (nc) {
        console.log('connecting to channel', channel)
        const sub = nc.subscribe(channel, { 
            callback: (err, msg) => {
                onMessage(err, sc.decode(msg.data));
            }
        });
        setSubscription(sub);
        setIsConnecting(false);
    }

    return () => {
      sub?.unsubscribe();
    }
  }, [nc]);

  const publish = (message: string) => {
    nc?.publish(channel, sc.encode(message));
  }

  return { nc, sub, isConnecting, publish };
}

export const useRealtimeChannel: <QueryT, MutationT, MutationInputT>(
    queryKey: QueryKey,
    queryFn: QueryFunction<QueryT>,
    mutationFn: MutationFunction<MutationT, MutationInputT>,
    opts?: {
        query: UseQueryOptions<QueryT>,
        mutation: UseMutationOptions<MutationT, any, MutationInputT, any>
    }
) => {
    query: UseQueryResult<QueryT>,
    mutation: UseMutationResult<MutationT, any, MutationInputT, any>,
    channel: ReturnType<typeof useChannel>
} = (
    queryKey, 
    queryFn, 
    mutationFn, 
    opts
) => {
    const client = useQueryClient();
    const query = useQuery(queryKey, {
        queryFn,
        ...opts?.query
    });
    const channel = useChannel(JSON.stringify(queryKey), (err, msg) => {
        console.log('invalidating query with the key', queryKey)
        client.invalidateQueries(queryKey);
    })

    const invalidateAllClients = useCallback(() => {
        channel.nc?.publish(JSON.stringify(queryKey), sc.encode(JSON.stringify(queryKey)));
    }, [channel]);

    const mutation = useMutation(
        mutationFn,
        {
            onSuccess: (data, variables, context) => {
                invalidateAllClients();
                if (opts?.mutation.onSuccess) {
                    opts?.mutation.onSuccess(data, variables, context);
                }
            },
            ...opts?.mutation
        }
    )

    return {query, mutation, channel };
}

export const useRealtimeInvalidator = (key: QueryKey) => {
    const client = useQueryClient();
    const channel = useChannel(JSON.stringify(key), (err, msg) => {
        client.invalidateQueries(key);
    })

    const invalidateAllClients = useCallback(() => {
        channel.publish(JSON.stringify(key));
    }, [channel])

    return {...channel, invalidateAllClients};
}