import xs from 'xstream';

export default ({ HTTP, EB }) => {
    return {
        botInit$: EB.address('bot.init').debug('botInit$'),
        botNotice$: EB.address('bot.notice').debug('botNotice$'),
        botNick$: EB.address('bot.nick').debug('botNick$'),
        botFail$: EB.address('bot.fail').debug('botFail$'),
        botExit$: EB.address('bot.exit').debug('botExit$'),
        botDccInit$: EB.address('bot.dcc.init').debug('botDccInit$'),
        botDccStart$: EB.address('bot.dcc.start').debug('botDccStart$'),
        botDccProgress$: EB.address('bot.dcc.progress').debug(
            'botDccProgress$'
        ),
        botDccQueue$: EB.address('bot.dcc.queue').debug('botDccQueue$'),
        botDccFinish$: EB.address('bot.dcc.finish').debug('botDccFinish$'),
        botsRemoved$: EB.address('removed').debug('botsRemoved$'),
        serverStateWs$: EB.address('state').debug('serverStateEb$'),

        serverState$: HTTP.select('srvstate')
            .map(response$ =>
                response$.replaceError(e => xs.of({ ...e, body: {} }))
            )
            .flatten()
            .map(res => res.body)
            .debug('server state response')
    };
};
