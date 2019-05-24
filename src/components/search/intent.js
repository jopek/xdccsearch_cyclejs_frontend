import xs from 'xstream';

export default ({ DOM, HTTP }) => ({
    loadMoreBtnClick$: DOM.select('.loadMore')
        .events('click')
        .mapTo(null),

    searchPageResults$: HTTP.select('searchpage')
        .map(resp$ => resp$.replaceError(err => xs.of(err)))
        .flatten()
        .map(resp => (resp instanceof Error ? resp : resp.body))
        .debug('search paging response')
});
