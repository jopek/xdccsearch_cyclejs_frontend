import xs from 'xstream';
import isolate from '@cycle/isolate';
import { div, hr, pre } from '@cycle/dom';
import Search from '../search';
import Transfer from '../transfers';

export default sources => {
    const state$ = sources.state.stream;
    const searchSinks = isolate(Search)(sources);
    const transfersSinks = isolate(Transfer)(sources);

    const vdom$ = xs
        .combine(state$, searchSinks.DOM, transfersSinks.DOM)
        .map(([state, search, transfers]) =>
            div('.app', [
                transfers,
                hr(),
                search,
                hr(),
                pre([JSON.stringify(state, null, 2)])
            ])
        );
    const reducer$ = xs.merge(searchSinks.state, transfersSinks.state);
    return {
        DOM: vdom$,
        state: reducer$,
        HTTP: xs.merge(searchSinks.HTTP, transfersSinks.HTTP)
    };
};
