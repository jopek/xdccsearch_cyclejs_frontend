import xs from 'xstream';
import isolate from '@cycle/isolate';
import { div, hr, pre, span, button, i } from '@cycle/dom';
import Search from '../search';
import Transfer from '../transfers';
import { ClosableCard } from '../closablecard';

const defaultState = {
    search: {
        results: [],
        page: 0,
        hasMore: false,
        inTransfer: {}
    },
    transfers: {}
};

const searchLens = {
    get: state => ({
        ...state.search,
        inTransfer: Object.keys(state.transfers)
            .map(bot => state.transfers[bot].pack)
            .reduce((acc, v) => {
                acc[v.pid] = true;
                return acc;
            }, {})
    }),
    set: (state, searchState) => ({ ...state, search: { ...searchState } })
};

export default sources => {
    const state$ = sources.state.stream;

    const searchSinks = isolate(ClosableCard(Search), {
        state: searchLens
    })({
        ...sources,
        props: xs.of({ title: 'Search' })
    });

    const transfersSinks = isolate(ClosableCard(Transfer), 'transfers')({
        ...sources,
        props: xs.of({ title: 'Transfers' })
    });

    const vdom$ = xs
        .combine(state$, searchSinks.DOM, transfersSinks.DOM)
        .map(([state, search, transfers]) => div([transfers, search]));

    const reducer$ = xs.merge(
        xs.of(state => (!!state ? state : defaultState)),
        searchSinks.state,
        transfersSinks.state
    );

    return {
        DOM: vdom$,
        state: reducer$,
        HTTP: xs.merge(searchSinks.HTTP, transfersSinks.HTTP)
    };
};
