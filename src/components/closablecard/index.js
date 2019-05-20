import xs from 'xstream';
import { button, div, h3, span } from '@cycle/dom';

const ClosableCard = child => sources => {
    // debugger
    sources.state.stream.debug('Wrapper state');
    const closeContent$ = sources.DOM.select('.doClose')
        .events('click')
        .fold((acc, v) => !acc, false);

    const props$ = xs.merge(xs.of({ title: '' }), sources.props);

    const childSinks = child(sources);

    const vdom$ = xs
        .combine(closeContent$, childSinks.DOM, props$)
        .map(([close, cvdom, props]) =>
            div('.card m-2', [
                div('.card-header font-weight-bold', [
                    button(
                        '.btn btn-primary mr-3 doClose',
                        span(`. fas fa-chevron-${close ? 'up' : 'down'}`)
                    ),
                    h3('. d-inline align-top', props.title)
                ]),
                div(`.card-body collapse ${close ? '' : 'show'}`, cvdom)
            ])
        );
    return {
        ...childSinks,
        DOM: vdom$
    };
};

export { ClosableCard } ;
