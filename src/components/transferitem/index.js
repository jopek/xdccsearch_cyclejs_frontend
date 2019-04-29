import xs from 'xstream';
import { makeCollection } from '@cycle/state';
import { li, ul, pre } from '@cycle/dom';

const defaultState = {
    startedTimestamp: 1556487827332,
    duration: 59964,
    timestamp: 1556487887296,
    speed: 4012.14572805265,
    dccstate: 'FINISH',
    botstate: 'EXIT',
    messages: [
        '** Sending you pack #337 ("[M3]_Czarface-Double_Dose_of_Danger-WEB-2019-UVU.tar"), which is 68MB. (resume supported)',
        'bot jjzm exiting because: finished transfer'
    ],
    oldBotNames: [],
    bot: 'jjzm',
    filenameOnDisk:
        'downloads/[M3]_Czarface-Double_Dose_of_Danger-WEB-2019-UVU._0_.tar.part',
    bytesTotal: 71516160,
    bytes: 68290352,
    pack: {
        pid: 555419788,
        cname: '#0day-mp3s',
        n: 337,
        name: '[M3]_Czarface-Double_Dose_of_Danger-WEB-2019-UVU.tar',
        gets: 0,
        nname: 'SceneP2P',
        naddr: 'irc.scenep2p.net',
        nport: 6667,
        uname: 'Oday-YEA0',
        sz: 71303168,
        szf: '68 MB',
        age: 1556434011,
        agef: '14 hr ago',
        last: 1556448437,
        lastf: '10 hr ago'
    }
};

export default sources => {
  const state$ = sources.state.stream;
  const reducer$ = xs.merge(
      xs.of(state => (!state ? defaultState : state))
      // intent.mapTo(state => state + 'y')
  );

  const vdom$ = state$.map(s =>
      li('.item', [pre([JSON.stringify(s, null, 2)])])
  );

  return {
      DOM: vdom$,
      state: reducer$
  };
};
