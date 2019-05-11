import xs from 'xstream';
import { run } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { withState } from '@cycle/state';
import EventBus from 'vertx3-eventbus-client';
// import search from './components/search';
// import transfers from './components/transfers';
// import Item from './components/transferitem';
import app from './components/app';

// const main = withState(search);
// const main = withState(Item);
const main = withState(app);
// const main = withState(transferList);
// const main = withState(transfers);

const makeVertxEventbusDriver = () => {
    const eb = new EventBus('/eventbus');
    const connectionOpened = new Promise((resolve, reject) => {
        eb.onopen = resolve
    });

    return () => ({
        address: address => {
            const incoming$ = xs.create({
                start: listener => {
                    connectionOpened.then(() => {
                        console.debug('eventbus on open for', address);
                        eb.registerHandler(address, (err, msg) => {
                            if (err) listener.error(err);
                            // console.debug('message on', address, msg)
                            listener.next(msg.body);
                        });
                    });
                },
                stop: () => connection.close()
            });
            return adapt(incoming$);
        }
    });
};

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    EB: makeVertxEventbusDriver()
});
