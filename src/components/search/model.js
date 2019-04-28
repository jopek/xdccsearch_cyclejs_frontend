import xs from 'xstream';

const defaultResults = [
  {
      pid: 1,
      name: 'xxx',
      nname: 'Criten',
      naddr: 'irc.criten.net',
      nport: 6667,
      cname: '#0day-mp3s',
      uname: 'Oday-YEA7',
      szf: '62 MB'
  },
  {
      pid: 2,
      name: 'asdasd',
      nname: 'Criten',
      cname: '#0day-mp3s',
      uname: 'Oday-YEA7',
      szf: '62 MB'
  },
  {
      pid: 3,
      name: 'kjhas',
      nname: 'Abjects',
      cname: '#0day',
      uname: 'OYEA7',
      szf: '62 MB'
  },
  {
      pid: 4,
      name: 'yyy',
      nname: 'Criten',
      cname: '#3s',
      uname: 'O-YEA7',
      szf: '62 MB'
  }
];

const defaultState = {
  term: '',
  results: defaultResults,
  page: 0,
  hasMore: false
};


export default intents => {
  const defaultReducer$ = xs.of(
      prevState =>
          typeof prevState === 'undefined' ? defaultState : prevState
  );

  const submitSearch$ = intents.searchBtnClick$.mapTo(state => ({
      ...state,
      page: 0
  }));

  const searchTerm$ = intents.searchTerm$.map(term => state => ({
      ...state,
      term
  }));

  const hasMorePages$ = xs
      .merge(intents.searchResults$, intents.searchPageResults$)
      .map(res => state => {
          const resultListDefined = res.results !== undefined;
          const morePages = res.pc - (res.pn + 1) > 0;
          return {
              ...state,
              hasMore: morePages && resultListDefined
          };
      });

  const appendResult$ = intents.searchPageResults$
      .debug('appendResult')
      .map(res => state => ({
          ...state,
          results: state.results.concat(res.results || []),
          page: res.pn
      }));

  const saveResult$ = intents.searchResults$
      .debug('saveResult')
      .map(res => state => ({
          ...state,
          results: res.results,
          page: res.pn
      }));

  return xs.merge(
      defaultReducer$,
      submitSearch$,
      searchTerm$,
      hasMorePages$,
      saveResult$,
      appendResult$
  );
};
