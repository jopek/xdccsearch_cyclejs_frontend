import xs from 'xstream';
import { pre } from '@cycle/dom';

export default sources => ({
    DOM: xs
        .combine(sources.EB.address('time'), sources.EB.stateStream$)
        .map(([t, s]) => pre([JSON.stringify({ t, s }, null, 2)]))
});
