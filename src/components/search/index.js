import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { div, button, input, h1, h3, span } from '@cycle/dom';
import isolate from '@cycle/isolate';
import ResultList from './resultlist';
import { SearchBar } from './searchbar';
import intent from './intent';
import model from './model';

const renderLoadingSpinner = loading =>
    span('. spinner-border spinner-border ml-auto fade ', {
        class: { show: loading }
    });

const renderInfo = (phrase, loading, error, hasResults) => {
    if (error) return div('. alert alert-danger', ['error loading response']);

    const hasPhrase = phrase.length > 0;
    const v = (loading, message) =>
        div('. alert alert-light d-flex', [
            h3('. d-inline', `${message}`),
            renderLoadingSpinner(loading)
        ]);

    if (!loading && !hasResults && hasPhrase)
        return v(loading, `no search results for "${phrase}"`);

    // if (!loading && hasResults && hasPhrase) return v(loading, `results for "${phrase}"`);
    // if (loading && hasPhrase) return v(loading, `searching for "${phrase}"`);
    if (hasPhrase) return v(loading, `results for "${phrase}"`);

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
                    renderInfo(
                        phrase,
                        searchIsError,
                        searchIsLoading,
                        state.results.length > 0
                    ),
                    rlist,
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
    const state$ = sources.state.stream;

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
        searchResponse$: searchBarSinks.searchResponse$,
        searchIsError$: searchBarSinks.isError$
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
