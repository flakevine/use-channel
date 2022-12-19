import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useChannelBase } from "./useChannel";

export const useRealtimeInvalidator = (queryKey: QueryKey) => {
    const client = useQueryClient();
    const channel = useChannelBase(JSON.stringify(queryKey), (err, msg) => {
        client.invalidateQueries(queryKey);
    });

    const invalidateAllClients = useCallback(() => {
        channel.pub(JSON.stringify(queryKey));
    }, [channel]);

    return { ...channel, invalidateAllClients };
};
