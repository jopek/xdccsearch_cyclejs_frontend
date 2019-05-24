import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { div, button, input, h1, h3, span } from '@cycle/dom';
import isolate from '@cycle/isolate';
import ResultList from './resultlist';
import { SearchBar } from './searchbar';
import intent from './intent';
import model from './model';

const renderInfo = (phrase, loading, error) => {
    if (error) return div('. alert alert-danger', ['error loading response']);

    if (phrase.length > 0)
        return div('. alert alert-light', [
            h3('. d-inline', `search results for '${phrase}': `),
            loading ? span('.spinner-border spinner-border-sm') : null
        ]);

    return null;
};

const view = (
    state$,
    searchBarDOM,
    searchPhrase$,
    searchIsError$,
    searchIsLoading$,
    resultListDOM
) => {
    return xs
        .combine(
            state$,
            searchBarDOM,
            searchPhrase$,
            searchIsError$,
            searchIsLoading$,
            resultListDOM
        )
        .map(
            ([
                state,
                searchBar,
                phrase,
                searchIsError,
                searchIsLoading,
                rlist
            ]) =>
                div('.search', [
                    searchBar,
                    renderInfo(phrase, searchIsError, searchIsLoading),
                    state.results.length > 0
                        ? rlist
                        : div('. jumbotron', [
                              h1('. display-4 text-black-50', [
                                  span('. fas fa-search'),
                                  'no results'
                              ])
                          ]),
                    state.hasMore
                        ? button(
                              '.loadMore d-block btn btn-primary mt-3 mx-auto',
                              ['load more']
                          )
                        : null
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

    const searchBarSinks = SearchBar(sources);
    const resultListSinks = isolate(ResultList, { state: listLens })(sources);

    const loadMoreReq$ = actions.loadMoreBtnClick$
        .compose(sampleCombine(searchBarSinks.searchPhrase$, state$))
        .map(([click, term, state]) => {
            const nextPage = state.page + 1;
            const termEncoded = encodeURIComponent(term);
            return {
                url: `/api/search?q=${termEncoded}&pn=${nextPage}`,
                category: 'searchpage',
                isRequest: true // duck typing :(
            };
        });

    const request$ = xs.merge(
        loadMoreReq$,
        searchBarSinks.HTTP,
        resultListSinks.HTTP
    );

    const reducer$ = model({
        ...actions,
        searchPhrase$: searchBarSinks.searchPhrase$,
        searchResponse$: searchBarSinks.searchResponse$
    });

    return {
        DOM: view(
            state$,
            searchBarSinks.DOM,
            searchBarSinks.searchPhrase$,
            searchBarSinks.isLoading$,
            searchBarSinks.isError$,
            resultListSinks.DOM
        ),
        state: xs.merge(reducer$, resultListSinks.state),
        HTTP: request$.debug()
    };
};
