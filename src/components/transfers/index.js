import xs from 'xstream';
import isolate from '@cycle/isolate';
import intent from './intent';
import model from './model';
import TransferList from './transferlist';

const txLens = {
    get: state => Object.keys(state).map(k => state[k]),
    set: (state, txState) => ({ ...state, [txState.bot]: txState })
};

export default sources => {
    const state$ = sources.state.stream;
    const actions = intent(sources);
    const reducer$ = model(actions);

    const transferListSinks = isolate(TransferList, { state: txLens })(sources);

    const vdom$ = transferListSinks.DOM;
    const request$ = xs
        .merge(
            xs.of(null),
            xs.periodic(15000)
        )
        .mapTo({
            url: '/api/state',
            category: 'srvstate'
        });

    return {
        DOM: vdom$,
        state: reducer$,
        HTTP: request$
    };
};