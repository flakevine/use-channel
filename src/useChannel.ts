import {
    MutationFunction,
    QueryFunction,
    QueryKey,
    useMutation,
    UseMutationOptions,
    UseMutationResult,
    useQuery,
    useQueryClient,
    UseQueryOptions,
    UseQueryResult,
} from "@tanstack/react-query";
import { SubscriptionOptions } from "nats";
import {
    connect,
    NatsConnection,
    NatsError,
    StringCodec,
    Subscription,
} from "nats.ws";
import React, { useCallback, useEffect, useState } from "react";

const sc = StringCodec();

const useNatsConnection = (servers: string | string[]) => {
    const [nc, setConnection] = useState<NatsConnection>();

    useEffect(() => {
        connect({ servers }).then((connection) => {
            setConnection(connection);
        });
    }, []);

    const subscribe = useCallback((channel: string, opts?: SubscriptionOptions) => {
        return nc?.subscribe(channel, opts);
    }, [nc])

    const publish = useCallback((channel: string, message: string) => {
        nc?.publish(channel, sc.encode(message));
    }, [nc])

    return { connection: nc, subscribe, publish };
};

export const useChannel = (
    channel: string,
    onMessage: (err: NatsError | null, msg: string) => void
) => {
    const { connection, subscribe, publish } = useNatsConnection(["ws://localhost:4444"]);
    const [sub, setSubscription] = useState<Subscription>();
    const [isConnecting, setIsConnecting] = useState<boolean>(true);

    useEffect(() => {
        if (connection) {
            console.log("connecting to channel", channel);
            const sub = subscribe(channel, {
                callback: (err, msg) => {
                    onMessage(err, sc.decode(msg.data));
                },
            });
            setSubscription(sub);
            setIsConnecting(false);
        }

        return () => {
            sub?.unsubscribe();
        };
    }, [connection]);

    const pub = (message: string) => {
        publish(channel, message);
    };

    return { connection, isConnecting, sub, pub };
};

export const useRealtimeChannel: <QueryT, MutationT, MutationInputT>(
    queryKey: QueryKey,
    queryFn: QueryFunction<QueryT>,
    mutationFn: MutationFunction<MutationT, MutationInputT>,
    opts?: {
        query: UseQueryOptions<QueryT>;
        mutation: UseMutationOptions<MutationT, any, MutationInputT, any>;
    }
) => {
    query: UseQueryResult<QueryT>;
    mutation: UseMutationResult<MutationT, any, MutationInputT, any>;
    channel: ReturnType<typeof useChannel>;
} = (queryKey, queryFn, mutationFn, opts) => {
    const client = useQueryClient();
    const query = useQuery(queryKey, {
        queryFn,
        ...opts?.query,
    });
    
    const channel = useChannel(JSON.stringify(queryKey), (err, msg) => {
        console.log("invalidating query with the key", queryKey);
        client.invalidateQueries(queryKey);
    });

    const invalidateAllClients = useCallback(() => {
        channel.pub(JSON.stringify(queryKey));
    }, [channel]);

    const mutation = useMutation(mutationFn, {
        onSuccess: (data, variables, context) => {
            invalidateAllClients();
            if (opts?.mutation.onSuccess) {
                opts?.mutation.onSuccess(data, variables, context);
            }
        },
        ...opts?.mutation,
    });

    return { query, mutation, channel };
};

export const useRealtimeInvalidator = (queryKey: QueryKey) => {
    const client = useQueryClient();
    const channel = useChannel(JSON.stringify(queryKey), (err, msg) => {
        client.invalidateQueries(queryKey);
    });

    const invalidateAllClients = useCallback(() => {
        channel.pub(JSON.stringify(queryKey));
    }, [channel]);

    return { ...channel, invalidateAllClients };
};
