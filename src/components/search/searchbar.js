import xs from 'xstream';
import { div, input, button } from '@cycle/dom';
import sampleCombine from 'xstream/extra/sampleCombine';

const SearchBar = sources => {
    const searchTermInput$ = sources.DOM.select('.searchTerm').events('input');

    const searchTermEnter$ = sources.DOM.select('.searchTerm')
        .events('keyup')
        .filter(ev => ev.keyCode === 13);

    const submitSearchClick$ = sources.DOM.select('.submitBtn').events('click');

    const searchSubmit$ = xs.merge(submitSearchClick$, searchTermEnter$);

    const searchPhrase$ = searchSubmit$
        .compose(sampleCombine(searchTermInput$))
        .map(([_, ev]) => (ev instanceof InputEvent ? ev.target.value : ''))
        .startWith('');

    const request$ = searchPhrase$
        .filter(term => term.length > 2)
        .map(encodeURIComponent)
        .map(term => ({
            url: `/api/search?q=${term}`,
            category: 'search',
            isRequest: true // duck typing :(
        }));

    const response$ = sources.HTTP.select('search')
        .map(resp$ => resp$.replaceError(err => xs.of(err)))
        .flatten()
        .map(resp => (resp instanceof Error ? resp : resp.body))
        .debug('search response');

    const isLoading$ = xs
        .merge(request$, response$)
        .map(r => r && r.isRequest)
        .startWith(false);

    const isError$ = xs
        .merge(request$, response$)
        .map(r => r instanceof Error)
        .startWith(false);

    const vdom$ = searchPhrase$.map(searchPhrase =>
        div('. SearchBar input-group mb-3', [
            input('. searchTerm form-control', {
                attrs: {
                    type: 'text',
                    autofocus: true,
                    placeholder: 'enter search phrase'
                },
                props: {
                    value: searchPhrase
                }
            }),
            div('. input-group-append', [
                button('. submitBtn btn btn-outline-secondary fas', {
                    class: {
                        'fa-times': searchPhrase.length > 0,
                        'fa-search': searchPhrase.length === 0
                    }
                })
            ])
        ])
    );

    return {
        DOM: vdom$,
        HTTP: request$,
        searchResponse$: response$,
        searchPhrase$,
        isError$,
        isLoading$
    };
};

export { SearchBar };
