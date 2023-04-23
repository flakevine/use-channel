import { useLogger } from './useLogger';
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useChannelBase } from "./useChannel";

export const useRealtimeInvalidator = (queryKey: QueryKey) => {
    const logger = useLogger();
    const client = useQueryClient();
    const channel = useChannelBase(JSON.stringify(queryKey), (_err, _msg) => {
        logger.log("Invalidating query with the key", queryKey);
        client.invalidateQueries(queryKey);
    });

    const invalidateAllClients = useCallback(() => {
        channel.pub(JSON.stringify(queryKey));
    }, [channel]);

    return { ...channel, invalidateAllClients };
};
