import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { makeCollection } from '@cycle/state';
import { span, div, h5, i } from '@cycle/dom';

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
    const click$ = sources.DOM.select('.download').events('click');
    const vdom$ = state$.map(s =>
        div(
            `.item list-group-item list-group-item-action ${
                !!s.transferring ? 'text-black-50' : ''
            }`,
            [
                div('.d-flex justify-content-between', [
                    div([
                        h5('.packname text-truncate', [`${s.name}`]),
                        div('.mb-1 d-flex justify-content-between', [
                            span([span('. far fa-user'), span(` ${s.uname}`)]),
                            span([span('. font-weight-bold mr-1', '#'), span(`${s.cname.substring(1)}`)]),
                            span([span('. fas fa-cloud'), span(` ${s.nname}`)]),
                            s.szf
                        ]),
                    ]),
                    i('.download fas fa-cloud-download-alt fa-3x my-auto')
                ])
            ]
        )
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
                .map(itemVNodes =>
                    div('.results list-group list-group-flush', itemVNodes)
                ),
            state: instances.pickMerge('state'),
            HTTP: instances.pickMerge('HTTP')
        };
    }
});
