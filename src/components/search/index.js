import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { div, button, input } from '@cycle/dom';
import isolate from '@cycle/isolate';
import ResultList from './resultlist';
import intent from './intent';
import model from './model';

const view = (state$, resultListDOM) => {
    return xs
        .combine(state$, resultListDOM)
        .map(([state, rlist]) =>
            div('.search', [
                div('.searchbox', [
                    input('.searchTerm', { attrs: { value: 'lala' } }),
                    button('.searchBtn', ['search'])
                ]),
                rlist,
                state.hasMore ? button('.loadMore', ['load more']) : null
            ])
        );
};

export default sources => {
    const state$ = sources.state.stream.debug('state');

    const actions = intent(sources);
    const reducer$ = model(actions);

    const searchReq$ = actions.searchBtnClick$
        .compose(sampleCombine(state$))
        .map(([click, state]) => state)
        .filter(state => state.term.length > 2)
        .map(state => ({
            url: `/api/search?q=${encodeURIComponent(state.term)}&pn=${
                state.page
            }`,
            headers: { 'content-type': 'application/json' },
            category: 'search'
        }))
        .debug();

    const loadMoreReq$ = actions.loadMoreBtnClick$
        .compose(sampleCombine(state$))
        .map(([click, state]) => state)
        .map(state => ({
            url: `/api/search?q=${encodeURIComponent(
                state.term
            )}&pn=${state.page + 1}`,
            headers: { 'content-type': 'application/json' },
            category: 'searchpage'
        }))
        .debug();

    const resultListSinks = isolate(ResultList, 'results')(sources);
    const request$ = xs.merge(searchReq$, loadMoreReq$, resultListSinks.HTTP);

    return {
        DOM: view(state$, resultListSinks.DOM),
        state: xs.merge(reducer$, resultListSinks.state),
        HTTP: request$
    };
};
