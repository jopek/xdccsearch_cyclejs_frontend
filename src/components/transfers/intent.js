import xs from 'xstream';

export default ({ HTTP, WS }) => {
    const wsMessage$ = WS.map(transportEvent => transportEvent.data).map(
        JSON.parse
    );

    const msgType = mType => message => message.type == mType;

    return {
        botInit$: wsMessage$.filter(msgType('bot.init')).debug('botInit$'),
        botNotice$: wsMessage$
            .filter(msgType('bot.notice'))
            .debug('botNotice$'),
        botNick$: wsMessage$.filter(msgType('bot.nick')).debug('botNick$'),
        botFail$: wsMessage$.filter(msgType('bot.fail')).debug('botFail$'),
        botExit$: wsMessage$.filter(msgType('bot.exit')).debug('botExit$'),
        botDccInit$: wsMessage$
            .filter(msgType('bot.dcc.init'))
            .debug('botDccInit$'),
        botDccStart$: wsMessage$
            .filter(msgType('bot.dcc.start'))
            .debug('botDccStart$'),
        botDccProgress$: wsMessage$
            .filter(msgType('bot.dcc.progress'))
            .debug('botDccProgress$'),
        botDccQueue$: wsMessage$
            .filter(msgType('bot.dcc.queue'))
            .debug('botDccQueue$'),
        botDccFinish$: wsMessage$
            .filter(msgType('bot.dcc.finish'))
            .debug('botDccFinish$'),

        serverState$: HTTP.select('srvstate')
            .map(response$ =>
                response$.replaceError(e => xs.of({ ...e, body: {} }))
            )
            .flatten()
            .map(res => res.body)
            .debug('server state response')
    };
};
