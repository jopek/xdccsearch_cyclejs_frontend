import xs from 'xstream';

const defaultResults = [
    {
        name: 'xxx',
        nname: 'Criten',
        naddr: 'irc.criten.net',
        nport: 6667,
        cname: '#0day-mp3s',
        uname: 'Oday-YEA7',
        szf: '62 MB',
    },
    {
        name: 'asdasd',
        nname: 'Criten',
        cname: '#0day-mp3s',
        uname: 'Oday-YEA7',
        szf: '62 MB',
    },
];

const defaultState = {
    results: defaultResults,
    page: 0,
    hasMore: false,
    inTransfer: { 2: true },
};

export default (intents) => {
    const defaultReducer$ = xs.of((prevState) =>
        typeof prevState === 'undefined' ? defaultState : prevState
    );

    const submitSearch$ = intents.searchPhrase$.mapTo((state) => ({
        ...state,
        page: 0,
    }));

    const hasMorePages$ = xs
        .merge(intents.searchResponse$, intents.searchPageResults$)
        .map((res) => (state) => {
            const resultListDefined = res.results !== undefined;
            const morePages = res.pc - (res.pn + 1) > 0;
            return {
                ...state,
                hasMore: morePages && resultListDefined,
            };
        });

    const appendResult$ = intents.searchPageResults$
        .debug('appendResult')
        .map((res) => (state) => ({
            ...state,
            results: state.results.concat(
                (res.results || []).filter((item) => item.uname)
            ),
            page: res.pn,
        }));

    const saveResult$ = intents.searchResponse$
        .debug('saveResult')
        .map((res) => (state) => ({
            ...state,
            results: (res.results || []).filter((item) => item.uname),
            page: res.pn,
        }));

    return xs.merge(
        defaultReducer$,
        submitSearch$,
        hasMorePages$,
        saveResult$,
        appendResult$
    );
};
