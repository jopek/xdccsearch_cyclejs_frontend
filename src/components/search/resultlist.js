import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { makeCollection } from '@cycle/state';
import { span, li, ul } from '@cycle/dom';


const itemDefaultState = {
  pid: 9999999,
  name: 'XXXXXXXXXXXXXXXXXXXXXXXX',
  nid: 3,
  nname: 'Criten',
  naddr: 'irc.criten.net',
  nport: 6667,
  cid: 1755571956,
  cname: '#0day-mp3s',
  uid: 941660793,
  uname: 'Oday-YEA7',
  n: 376,
  gets: 8,
  sz: 65011712,
  szf: '62 MB',
  age: 1543571979,
  agef: '146 day ago',
  last: 1556195684,
  lastf: '2 hr ago'
};


const ResultItem = sources => {
    const state$ = sources.state.stream;
    const click$ = sources.DOM.select('.item').events('click');
    const vdom$ = state$.map(s =>
        li('.item', [
            span('.packname', [`${s.name}, ${s.szf}`]),
            span('.packdetails', [`${s.uname} @ ${s.nname} / ${s.cname}`])
        ])
    );
    const reducer$ = xs.merge(
        xs.of(state => (!state ? itemDefaultState : state))
        // intent.mapTo(state => state + 'y')
    );
    const request$ = click$
        .compose(sampleCombine(state$))
        .map(([c, state]) => state)
        .map(state => ({
            url: `/api/xfers`,
            method: 'post',
            headers: { 'content-type': 'application/json' },
            category: 'startXfer',
            send: state
        }));
    return {
        DOM: vdom$,
        state: reducer$,
        HTTP: request$
    };
};

export default makeCollection({
    item: ResultItem,
    itemKey: (childState, index) => index,
    itemScope: key => key, // use `key` string as the isolation scope
    collectSinks: instances => {
        return {
            DOM: instances
                .pickCombine('DOM')
                .map(itemVNodes => ul('.results', itemVNodes)),
            state: instances.pickMerge('state'),
            HTTP: instances.pickMerge('HTTP')
        };
    }
});
