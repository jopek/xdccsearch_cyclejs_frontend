import xs from 'xstream';
import { pre } from '@cycle/dom';

const defaultState = {};

export default sources => {
    const state$ = sources.state.stream;
    const reducer$ = xs.merge(xs.of(state => (!state ? defaultState : state)));
    const vdom$ = state$.map(s => pre([JSON.stringify(s, null, 2)]));

    return {
        DOM: vdom$,
        state: reducer$
    };
};
