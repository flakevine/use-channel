import {
    connect,
    NatsConnection,
    NatsError,
    StringCodec,
    Subscription,
    SubscriptionOptions,
} from "nats.ws";
import React, { useCallback, useEffect, useState } from "react";

const sc = StringCodec();

export const useNatsConnection = (servers: string | string[]) => {
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