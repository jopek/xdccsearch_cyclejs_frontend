import xs from 'xstream';
import _ from 'lodash';

const defaultState = {
    i7il: {
        startedTimestamp: 1556317154804,
        duration: 5944,
        timestamp: 1556317160748,
        speed: 0,
        dccstate: 'FAIL',
        messages: [
            '[\u0002Logon News\u0002 - May 21 2011] \u0002First time on Rizon? Be sure to read the FAQ! http://s.rizon.net/FAQ',
            '[\u0002Logon News\u0002 - Dec 16 2013] Own a large/active channel or plan to get one going? Please read http://s.rizon.net/authline',
            '[\u0002Random News\u0002 - Mar 20 2009] Idle on Rizon a lot? Why not play our idlerpg game, you can check it out at #RizonIRPG for more information visit the website http://idlerpg.rizon.net -Rizon Staff',
            'bot Oday-YEA7 not in channel #0day-mp3s',
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
            lastf: null,
        },
    },
};

export default (intents) => {
    const defaultReducer$ = xs.of((prevState) => (!prevState ? {} : prevState));

    const saveBotInit$ = intents.botInit$.map(({ type, ...res }) => (state) => {
        return {
            ...state,
            [res.bot]: {
                ...state[res.bot],
                ...res,
                started: res.timestamp,
                botstate: 'RUN',
            },
        };
    });

    const saveBotNotice$ = intents.botNotice$.map((res) => (state) => ({
        ...state,
        [res.bot]: {
            ...state[res.bot],
            timestamp: res.timestamp,
            messages: (state[res.bot].messages || []).concat(res.message),
        },
    }));

    const saveBotFail$ = intents.botFail$.map((res) => (state) => ({
        ...state,
        [res.bot]: {
            ...state[res.bot],
            messages: (state[res.bot].messages || []).concat(res.message),
            timestamp: res.timestamp,
            dccstate: 'FAIL',
        },
    }));

    const saveBotDccQueue$ = intents.botDccQueue$.map((res) => (state) => ({
        ...state,
        [res.bot]: {
            ...state[res.bot],
            timestamp: res.timestamp,
            messages: (state[res.bot].messages || []).concat(res.message),
            dccstate: 'QUEUE',
        },
    }));

    const saveBotDccInit$ = intents.botDccInit$.map((res) => (state) => ({
        ...state,
        [res.bot]: {
            ...state[res.bot],
            timestamp: res.timestamp,
            filename: res.filename,
            dccstate: 'INIT',
        },
    }));

    const updatedDuration$ = intents.count$.mapTo((state) =>
        Object.keys(state).reduce((p, k) => {
            p[k] = state[k];
            if (
                p[k].botstate === 'EXIT' ||
                ['FINISH', 'FAIL'].includes(p[k].dccState)
            ) {
                p[k].duration = p[k].timestamp - p[k].started;
            } else {
                console.log('recalculate duration');
                p[k].duration = Date.now() - p[k].started;
            }
            return p;
        }, {})
    );

    const removedStaleBots$ = intents.botsRemoved$.map(
        (removedBots) => (state) =>
            Object.keys(state).reduce((p, k) => {
                if (!removedBots.includes(k)) p[k] = state[k];
                return p;
            }, {})
    );

    const saveBotDccStart$ = intents.botDccStart$.map((res) => (state) => ({
        ...state,
        [res.bot]: {
            ...state[res.bot],
            timestamp: res.timestamp,
            bytesTotal: res.bytesTotal,
            filenameOnDisk: res.filenameOnDisk,
            dccstate: 'START',
        },
    }));

    const saveBotDccProgress$ = intents.botDccProgress$.map(
        (res) => (state) => ({
            ...state,
            [res.bot]: {
                ...state[res.bot],
                timestamp: res.timestamp,
                bytes: res.bytes,
                dccstate: 'PROGRESS',
            },
        })
    );

    const saveBotDccFinish$ = intents.botDccFinish$.map((res) => (state) => ({
        ...state,
        [res.bot]: {
            ...state[res.bot],
            timestamp: res.timestamp,
            dccstate: 'FINISH',
        },
    }));

    const saveBotExit$ = intents.botExit$.map((res) => (state) => ({
        ...state,
        [res.bot]: {
            ...state[res.bot],
            messages: (state[res.bot].messages || []).concat(res.message),
            timestamp: res.timestamp,
            botstate: 'EXIT',
        },
    }));

    const saveServerStateResponse$ = intents.serverState$.map(
        (res) => (state) => res
    );
    const saveServerStateWs$ = intents.serverStateWs$.map(
        ({ type, ...res }) => (state) => res
    );

    return xs.merge(
        defaultReducer$,
        saveBotInit$,
        saveBotNotice$,
        saveBotFail$,
        saveBotExit$,
        saveBotDccInit$,
        saveBotDccStart$,
        saveBotDccQueue$,
        saveBotDccProgress$,
        saveBotDccFinish$,
        removedStaleBots$,
        saveServerStateResponse$,
        saveServerStateWs$,
        updatedDuration$
    );
};
