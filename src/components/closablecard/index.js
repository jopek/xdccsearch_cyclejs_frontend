import xs from 'xstream';
import { button, div, h3, span } from '@cycle/dom';

const ClosableCard = child => sources => {
    const closeContent$ = sources.DOM.select('.doClose')
        .events('click')
        .fold((acc, v) => !acc, false);

    const props$ = xs.merge(xs.of({ title: '' }), sources.props);

    const childSinks = child(sources);

    const vdom$ = xs
        .combine(closeContent$, childSinks.DOM, props$)
        .map(([close, cvdom, props]) =>
            div('. card mx-2 mt-2 mb-2', [
                div('. card-header font-weight-bold text-secondary', [
                    button(
                        '. btn btn-sm btn-outline-secondary mr-3 doClose',
                        span('. fas ', {
                            class: {
                                'fa-chevron-down': close,
                                'fa-chevron-up': !close
                            }
                        })
                    ),
                    h3('. d-inline align-top', props.title)
                ]),
                div('. card-body collapse', { class: { show: !close } }, cvdom)
            ])
        );
    return {
        ...childSinks,
        DOM: vdom$
    };
};

export { ClosableCard };
