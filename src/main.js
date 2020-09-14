import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { withState } from '@cycle/state';
import { makeVertxEventbusDriver } from './vertxeventbusdriver';
import { timeDriver } from '@cycle/time';
import app from './components/app';

const main = withState(app);

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    TIME: timeDriver,
    EB: makeVertxEventbusDriver(),
});
