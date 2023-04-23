import { useContext } from 'react';
import { ChannelContext } from './useChannelContext';

const log = (...data: any[]) => {
    console.log('%c[useChannel]', 'color: dodgerblue; font-weight: 700;', ...data);
}

export const useLogger = () => {
    const opts = useContext(ChannelContext);

    if (!opts.logger) {
        return { log: (..._data: any[]) => {} }
    }

    return { log };
}
