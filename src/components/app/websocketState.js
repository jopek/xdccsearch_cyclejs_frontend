import xs from 'xstream';
import { div, button, span } from '@cycle/dom';

export default sources => ({
    DOM: xs
        .combine(
            sources.EB.wsReady$,
            sources.DOM.select('.close')
                .events('click')
                .fold((acc, v) => !acc, false)
        )
        .map(
            ([websocketReady, closed]) =>
                websocketReady
                    ? null
                    : div(
                          `. alert alert-warning alert-dismissible fade ${
                              closed ? '' : 'show'
                          }`,
                          { attrs: { role: 'alert' } },
                          ['websocked closed', button('. close', [span('x')])]
                      )
        )
});
