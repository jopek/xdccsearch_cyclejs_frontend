import xs from 'xstream';
import view from './view';
import sampleCombine from 'xstream/extra/sampleCombine';

export default (sources) => {
    const state$ = sources.state.stream.debug('transferitem state');
    const showMessages$ = sources.DOM.select('.show-messages')
        .events('click')
        .fold((acc, v) => !acc, false);
    const viewExpandedMode$ = sources.DOM.select('.transfer-item-toggle')
        .events('click')
        .fold((acc, v) => !acc, false);
    const cancelTransferClick$ = sources.DOM.select('.cancel-transfer')
        .events('click')
        .mapTo(null);
    const cancelTransferReq$ = cancelTransferClick$
        .debug('cancelTransferClick$')
        .compose(sampleCombine(state$))
        .map(([click, state]) => ({
            url: `/api/xfers/${state.bot}`,
            method: 'DELETE',
            category: 'cancelXfer',
        }))
        .debug();
    const reducer$ = xs.merge(xs.of((state) => (!state ? {} : state)));

    const vdom$ = view(state$, viewExpandedMode$, showMessages$);

    return {
        DOM: vdom$,
        state: reducer$,
        HTTP: cancelTransferReq$,
    };
};
