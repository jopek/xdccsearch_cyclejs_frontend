const xs = require('xstream').default;

const conn$ = xs.periodic(500).remember().debug('conn$');

// conn$.addListener({});

const incoming$ = xs.create({
    start: listener =>
        conn$
            .filter(c => c % 3 === 0)
            .addListener({
                next: c => {
                    console.log('regi', c);
                    listener.next('PING');
                }
            }),
    stop: () => connectionOpened.then(() => eb.unregisterHandler(address))
});

incoming$.addListener({ next: c => console.log('incoming c', c) });
