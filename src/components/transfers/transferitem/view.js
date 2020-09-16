import { a, button, div, h5, li, p, pre, small, span } from '@cycle/dom';
import xs from 'xstream';
import { sizeFormatter } from '../../utils';
const duration = (seconds) => {
    const numhours = Math.floor(seconds / 3600);
    const numminutes = Math.floor((seconds % 3600) / 60);
    const numseconds = Math.floor(seconds % 3600) % 60;

    const hstr = numhours > 0 ? `${numhours}h` : '';
    const mstr = numminutes > 0 ? `${numminutes}m` : '';

    return `${hstr}${mstr}${numseconds}s`;
};

const styleModifier = (state) => {
    switch (state.dccstate) {
        case 'FINISH':
            return 'success';

        case 'PROGRESS':
            return 'info';

        case 'FAIL':
            return 'danger';

        default:
            return state.botstate == 'EXIT' ? 'secondary' : 'primary';
    }
};

const progressFn = (s) =>
    !!s.bytesTotal ? ((s.bytes / s.bytesTotal) * 100).toFixed(1) : 0;

const collapsedListItemView = (state) => {
    const pack = state.pack;
    return a(
        `.transfer-item-toggle list-group-item list-group-item-action list-group-item-${styleModifier(
            state
        )}`,
        [
            h5('.mb-1', [`${pack.name}`]),
            div('.mb-1 d-flex justify-content-between', [
                span([span('. far fa-user'), span(` ${pack.uname}`)]),
                span([
                    span('. font-weight-bold mr-1', '#'),
                    span(`${pack.cname.substring(1)}`),
                ]),
                span([span('. fas fa-cloud'), span(` ${pack.nname}`)]),
                span(`${sizeFormatter(state.bytes)} (${progressFn(state)}%)`),
            ]),
        ]
    );
};

const expandedView = (state, showMessages) => {
    const dccstateStyle = styleModifier(state);
    const progress = progressFn(state);
    const pack = state.pack;

    return div(`.card m-1 border-${dccstateStyle}`, [
        div(
            `.transfer-item-toggle card-header font-weight-bold text-${dccstateStyle}`,
            [state.pack.name]
        ),
        div('.card-body', [
            p('.card-text d-flex justify-content-between', [
                span(`${state.dccstate} (${state.botstate})`),
                span(
                    `${sizeFormatter(state.bytes)} / ${sizeFormatter(
                        state.bytesTotal
                    )}`
                ),
                span([
                    span('. far fa-hourglass'),
                    span(` ${duration(Math.round(state.duration / 1000))}`),
                ]),
                span([span('. far fa-user'), span(` ${pack.uname}`)]),
                span([
                    span('. font-weight-bold mr-1', '#'),
                    span(`${pack.cname.substring(1)}`),
                ]),
                span([span('. fas fa-cloud'), span(` ${pack.nname}`)]),
            ]),
            div('.progress', [
                div(
                    `.progress-bar progress-bar-striped bg-${dccstateStyle} ${
                        state.dccstate === 'PROGRESS'
                            ? 'progress-bar-animated'
                            : ''
                    }`,
                    { style: { width: `${progress}%` } },
                    [`${sizeFormatter(state.bytes)} (${progress}%)`]
                ),
            ]),
            p('.mt-4 d-flex justify-content-between', [
                button('.btn btn-primary show-messages', ['messages']),
                button(
                    `.btn btn-danger cancel-transfer `,
                    { attrs: { disabled: state.botstate === 'EXIT' } },
                    ['cancel transfer']
                ),
            ]),
            div(`.collapse${!!showMessages ? 'show' : ''} messages`, [
                div('.card card-body', [
                    !!state.messages
                        ? pre(state.messages.map((x) => `${x}\n`))
                        : null,
                ]),
            ]),
        ]),
    ]);
};

export default (state$, viewExpandedMode$, showMessages$) =>
    xs
        .combine(state$, viewExpandedMode$, showMessages$)
        .map(([s, vmode, showMessages]) =>
            vmode ? expandedView(s, showMessages) : collapsedListItemView(s)
        );
