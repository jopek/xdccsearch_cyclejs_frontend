import xs from 'xstream';
import { makeCollection } from '@cycle/state';
import { li, ul, pre } from '@cycle/dom';

const defaultState = {
    startedTimestamp: 1556317154804,
    duration: 5944,
    timestamp: 1556317160748,
    speed: 0,
    dccstate: 'FAIL',
    messages: [
        '[\u0002Logon News\u0002 - May 21 2011] \u0002First time on Rizon? Be sure to read the FAQ! http://s.rizon.net/FAQ',
        '[\u0002Logon News\u0002 - Dec 16 2013] Own a large/active channel or plan to get one going? Please read http://s.rizon.net/authline',
        '[\u0002Random News\u0002 - Mar 20 2009] Idle on Rizon a lot? Why not play our idlerpg game, you can check it out at #RizonIRPG for more information visit the website http://idlerpg.rizon.net -Rizon Staff',
        'bot Oday-YEA7 not in channel #0day-mp3s'
    ],
    oldBotNames: [],
    bot: 'i7il',
    filenameOnDisk: null,
    bytesTotal: 0,
    bytes: 0,
    pack: {
        pid: 1,
        cname: '#0day-mp3s',
        n: 0,
        name: 'xxx',
        gets: 0,
        nname: 'Criten',
        naddr: 'irc.criten.net',
        nport: 6667,
        uname: 'Oday-YEA7',
        sz: 0,
        szf: '62 MB',
        age: 0,
        agef: null,
        last: 0,
        lastf: null
    }
};

const Item = sources => {
    const state$ = sources.state.stream;
    const vdom$ = state$.map(s =>
        li('.item', [
          pre([JSON.stringify(s, null, 2)])
        ])
    );
    const reducer$ = xs.merge(
        xs.of(state => (!state ? defaultState : state))
        // intent.mapTo(state => state + 'y')
    );
    return {
        DOM: vdom$,
        state: reducer$,
    };
};

export default makeCollection({
    item: Item,
    itemKey: (childState, index) => index,
    itemScope: key => key, // use `key` string as the isolation scope
    collectSinks: instances => {
        return {
            DOM: instances
                .pickCombine('DOM')
                .map(itemVNodes => ul('.transfers', itemVNodes)),
            state: instances.pickMerge('state'),
        };
    }
});
