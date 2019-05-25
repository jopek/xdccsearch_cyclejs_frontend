import xs from 'xstream';
import isolate from '@cycle/isolate';
import intent from './intent';
import model from './model';
import TransferList from './transferlist';

const txLens = {
    get: state => Object.keys(state).map(k => state[k]),
    set: (state, txState) => {
        const newState = txState.reduce((acc, v) => {
            acc[v.bot] = v;
            return acc;
        }, state);
        return { ...newState };
    }
};

export default sources => {
    const state$ = sources.state.stream;
    const actions = intent(sources);
    const reducer$ = model(actions);

    const transferListSinks = isolate(TransferList, { state: txLens })(sources);
    const wsReady$ = sources.EB.wsReady$;

    const vdom$ = transferListSinks.DOM;
    const request$ = xs.merge(
        transferListSinks.HTTP,
        xs
            .merge(
                // xs.of(null),
                //xs.periodic(15000)
                wsReady$.filter(wsReady => wsReady == true)
            )
            .mapTo({
            url: '/api/state',
            category: 'srvstate'
        })
            .debug('transfer state request')
    );

    return {
        DOM: vdom$,
        state: xs.merge(reducer$, transferListSinks.state),
        HTTP: request$
        // HTTP: xs.empty()
    };
};
