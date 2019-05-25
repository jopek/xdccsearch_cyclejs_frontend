import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { withState } from '@cycle/state';
import { makeVertxEventbusDriver } from './vertxeventbus';
// import search from './components/search';
// import transfers from './components/transfers';
// import Item from './components/transferitem';
import app from './components/app';

// const main = withState(search);
// const main = withState(Item);
const main = withState(app);
// const main = withState(transferList);
// const main = withState(transfers);

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    EB: makeVertxEventbusDriver()
});
