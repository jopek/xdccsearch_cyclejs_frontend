import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { div, button, input } from '@cycle/dom';
import isolate from '@cycle/isolate';
import ResultList from './resultlist';
import intent from './intent';
import model from './model';

const view = (state$, resultListDOM) => {
    return xs.combine(state$, resultListDOM).map(([state, rlist]) =>
        div('.search', [
            div('.searchbox input-group mb-3', [
                input('.searchTerm form-control', {
                    attrs: { value: 'lala' }
                }),
                div('.input-group-append', [
                    button('.searchBtn btn btn-outline-secondary', ['search'])
                ])
            ]),
            rlist,
            state.hasMore ? button('.loadMore', ['load more']) : null
        ])
    );
};

const listLens = {
    get: state =>
        state.results.map(r => {
            return {
                ...r,
                transferring: !!state.inTransfer[r.pid]
            };
        }),
    set: (state, results) => {
        return { ...state, results };
    }
};

export default sources => {
    const state$ = sources.state.stream.debug('state');

    const actions = intent(sources);
    const reducer$ = model(actions);

    const searchReq$ = actions.searchSubmit$
        .compose(sampleCombine(actions.searchTerm$))
        .map(([click, term]) => term)
        .filter(term => term.length > 2)
        .map(encodeURIComponent)
        .map(term => ({
            url: `/api/search?q=${term}`,
            category: 'search'
        }));

    const loadMoreReq$ = actions.loadMoreBtnClick$
        .compose(sampleCombine(actions.searchTerm$, state$))
        .map(([click, term, state]) => {
            const nextPage = state.page + 1;
            const termEncoded = encodeURIComponent(term);
            return {
                url: `/api/search?q=${termEncoded}&pn=${nextPage}`,
                category: 'searchpage'
            };
        });

    const resultListSinks = isolate(ResultList, { state: listLens })(sources);
    const request$ = xs.merge(searchReq$, loadMoreReq$, resultListSinks.HTTP);

    return {
        DOM: view(state$, resultListSinks.DOM),
        state: xs.merge(reducer$, resultListSinks.state),
        HTTP: request$.debug()
    };
};
