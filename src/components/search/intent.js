import xs from 'xstream';
import debounce from 'xstream/extra/debounce';

export default ({ DOM, HTTP }) => ({
    searchTerm$: DOM.select('.searchTerm')
        .events('input')
        .compose(debounce(300))
        .map(v => v.target.value),

    loadMoreBtnClick$: DOM.select('.loadMore')
        .events('click')
        .mapTo(null),

    searchBtnClick$: DOM.select('.searchBtn')
        .events('click')
        .mapTo(null),

    searchResults$: HTTP.select('search')
        .map(response$ =>
            response$.replaceError(e => xs.of({ ...e, body: [] }))
        )
        .flatten()
        .map(res => res.body)
        .debug('search response'),

    searchPageResults$: HTTP.select('searchpage')
        .map(response$ =>
            response$.replaceError(e => xs.of({ ...e, body: [] }))
        )
        .flatten()
        .map(res => res.body)
        .debug('search paging response')
});
