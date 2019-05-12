import xs from 'xstream';
import { adapt } from '@cycle/run/lib/adapt';
import EventBus from 'vertx3-eventbus-client';

const makeVertxEventbusDriver = () => {
    const eb = new EventBus('/eventbus');
    const connectionOpened = new Promise((resolve, reject) => {
        eb.onopen = resolve;
    }).then(() => console.debug('eventbus opened'));
    eb.onclose = e => console.debug('eventbus onclose', e);
    eb.enableReconnect(true);

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

export { makeVertxEventbusDriver };
