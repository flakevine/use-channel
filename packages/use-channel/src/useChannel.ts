import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Subscription, NatsError, StringCodec } from "nats.ws";
import { useCallback, useEffect, useState } from "react";
import type {
    QueryKey,
    QueryFunction,
    MutationFunction,
    UseQueryOptions,
    UseQueryResult,
    UseMutationOptions,
    UseMutationResult,
} from "@tanstack/react-query";
import { usePubsubMethod } from "./useChannelContext";

const sc = StringCodec();

export const useChannelBase = (
    channel: string,
    onMessage: (err: NatsError | null, msg: string) => void
) => {
    const { connection, subscribe, publish } = usePubsubMethod();
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

export const useChannel: <QueryT, MutationT, MutationInputT>(
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
    channel: ReturnType<typeof useChannelBase>;
} = (queryKey, queryFn, mutationFn, opts) => {
    const client = useQueryClient();
    const query = useQuery(queryKey, {
        queryFn,
        ...opts?.query,
    });

    const channel = useChannelBase(JSON.stringify(queryKey), (err, msg) => {
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
