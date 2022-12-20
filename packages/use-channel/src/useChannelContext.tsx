import React, { createContext, useContext } from "react"
import { useNatsConnection } from "./useNatsConnection"

export type PubsubConfig = {
    provider: 'nats'
    url: string
    logger?: boolean
}

type ChannelContextProps = {
    children: JSX.Element | JSX.Element[]
    opts: PubsubConfig
}

export const ChannelContext = createContext<PubsubConfig>(
    {} as PubsubConfig
)

const PubsubHooks = {
    nats: useNatsConnection
}

export const usePubsubMethod = () => {
    const opts = useContext(ChannelContext);
    
    return PubsubHooks[opts.provider]([opts.url])
}
    
export const ChannelContextProvider = ({ children, opts }: ChannelContextProps) => {
    return (
        <ChannelContext.Provider value={opts}>{children}</ChannelContext.Provider>
    )
}