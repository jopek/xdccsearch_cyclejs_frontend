import xs from 'xstream';
import { makeCollection } from '@cycle/state';
import { li, ul, pre } from '@cycle/dom';
import Item from "../transferitem";

export default makeCollection({
    item: Item,
    itemKey: (childState, index) => index,
    itemScope: key => key, // use `key` string as the isolation scope
    collectSinks: instances => {
        return {
            DOM: instances
                .pickCombine('DOM')
                .map(itemVNodes => ul('.transfers', itemVNodes)),
            state: instances.pickMerge('state')
        };
    }
});
