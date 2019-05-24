import xs from 'xstream';
import { adapt } from '@cycle/run/lib/adapt';
import EventBus from 'vertx3-eventbus-client';

const makeVertxEventbusDriver = () => {
    const eb = new EventBus('/eventbus');
    const handlers = {};
    const connectionOpened = new Promise((resolve, reject) => {
        eb.onopen = () => {
            Object.keys(handlers).map(address => {
                console.debug('reregistering eventbus handler for', address);
                eb.registerHandler(address, handlers[address]);
            });
            resolve();
        };
    });
    eb.enableReconnect(true);

    return () => ({
        address: address => {
            const incoming$ = xs.create({
                start: listener => {
                    connectionOpened.then(() => {
                        console.debug(
                            'registering eventbus handler for',
                            address
                        );
                        const handler = (err, msg) => {
                            if (err) listener.error(err);
                            // console.debug('message on', address, msg)
                            listener.next(msg.body);
                        };
                        eb.registerHandler(address, handler);
                        handlers[address] = handler;
                    });
                },
                stop: () =>
                    connectionOpened.then(() => eb.unregisterHandler(address))
            });
            return adapt(incoming$);
        }
    });
};

export { makeVertxEventbusDriver };
