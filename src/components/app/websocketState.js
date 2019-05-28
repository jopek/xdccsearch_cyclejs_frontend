import { h3, div, span } from '@cycle/dom';

export default sources => ({
    DOM: sources.EB.wsReady$.map(
        websocketReady =>
            websocketReady
                ? null
                : div('. alert alert-warning text-center', [
                      h3([
                          span('. fas fa-exclamation-triangle mr-2'),
                          'cannot connect to server'
                      ])
                  ])
    )
});
