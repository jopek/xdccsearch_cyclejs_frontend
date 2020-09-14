import xs from 'xstream';
import { makeCollection } from '@cycle/state';
import { div } from '@cycle/dom';
import Item from './transferitem';

export default makeCollection({
    item: Item,
    itemKey: (childState, index) => childState.bot,
    itemScope: (key) => key, // use `key` string as the isolation scope
    collectSinks: (instances) => {
        return {
            DOM: instances
                .pickCombine('DOM')
                .map((itemVNodes) => div('.transfers list-group', itemVNodes)),
            state: instances.pickMerge('state'),
            HTTP: instances.pickMerge('HTTP'),
        };
    },
});
