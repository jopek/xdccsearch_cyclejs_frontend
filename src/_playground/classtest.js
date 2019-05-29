import { div, input, p } from '@cycle/dom';

export default sources => ({
    DOM: sources.DOM.select('.in')
        .events('input')
        .map(e => e.target.value)
        .startWith('show')
        .map(i =>
            div([
                input('. in'),
                p('. alert fade ', { class: { show: i.length > 3 } }, [i])
            ])
        )
});
