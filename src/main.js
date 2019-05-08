import xs from 'xstream';
import { run } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { withState } from '@cycle/state';
import SockJS from 'sockjs-client';
// import search from './components/search';
// import transfers from './components/transfers';
// import Item from './components/transferitem';
import app from './components/app';

// const main = withState(search);
// const main = withState(Item);
const main = withState(app);
// const main = withState(transferList);
// const main = withState(transfers);

const makeWSDriver = () => {
    const connection = new SockJS('/sev');
    return () => {
        const incoming$ = xs.create({
            start: listener => {
                connection.onerror = err => listener.error(err);
                connection.onmessage = msg => listener.next(msg);
            },
            stop: () => connection.close()
        });
        return adapt(incoming$);
    };
};

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    WS: makeWSDriver()
});
