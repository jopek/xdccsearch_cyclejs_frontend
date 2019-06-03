import xs from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import { adapt } from '@cycle/run/lib/adapt';
import EventBus from 'vertx3-eventbus-client';

const makeVertxEventbusDriver = () => {
    const eb = new EventBus('/eventbus');
    eb.enableReconnect(true);

    const wsReady$ = xs
        .create({
            start: listener => {
                eb.onopen = () => listener.next(true);
                eb.onclose = () => listener.next(false);
            },
            stop: () => {}
        })
        .compose(dropRepeats());

    return () => ({
        // selector for eventbus addresses
        address: address => {
            const incoming$ = xs.create({
                start: listener =>
                    wsReady$
                        .filter(c => c === true)
                        .addListener({
                            next: c => {
                                console.debug(
                                    'registering eventbus handler for',
                                    address
                                );
                                eb.registerHandler(address, (err, msg) => {
                                    if (err) {
                                        listener.error(err);
                                        return;
                                    }
                                    listener.next(msg.body);
                                });
                            }
                        }),
                stop: () =>
                    wsReady$
                        .filter(c => c === true)
                        .addListener({
                            next: c => eb.unregisterHandler(address)
                        })
            });
            return adapt(incoming$);
        },
        // websocket ready stream (connection opened = true / connection closed = false)
        wsReady$
    });
};

export { makeVertxEventbusDriver };
