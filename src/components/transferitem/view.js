import { a, button, div, h5, li, p, pre, small, span } from '@cycle/dom';
import xs from 'xstream';
import { sizeFormatter } from './utils';
const duration = seconds => {
    const numhours = Math.floor(seconds / 3600);
    const numminutes = Math.floor((seconds % 3600) / 60);
    const numseconds = Math.floor(seconds % 3600) % 60;

    const hstr = numhours > 0 ? `${numhours}h` : '';
    const mstr = numminutes > 0 ? `${numminutes}m` : '';

    return `${hstr}${mstr}${numseconds}s`;
};

const styleModifier = state => {
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

const progressFn = s =>
    !!s.bytesTotal ? (s.bytes / s.bytesTotal * 100).toFixed(1) : 0;

const collapsedListItemView = state => {
    const pack = state.pack;
    return a(
        `.transfer-item-toggle list-group-item .list-group-item-action .list-group-item-${styleModifier(
            state
        )}`,
        [
            div('.d-flex .justify-content-between', [
                h5('.mb-1', [`${pack.name}`]),
                span('.badge .badge-primary .badge-pill', [
                    `${progressFn(state)}%`
                ])
            ]),
            div('.mb-1 .d-flex .justify-content-between', [
                span(`remote: ${pack.uname} @ ${pack.cname} on ${pack.nname}`),
                span(`size: ${pack.szf}`),
                span(`mode: ${state.dccstate} (${state.botstate})`)
            ])
        ]
    );
};

const expandedView = (state, showMessages) => {
    const dccstateStyle = styleModifier(state);
    const progress = progressFn(state);
    return div(`.card .m-1 .border-${dccstateStyle}`, [
        div(
            `.transfer-item-toggle .card-header .font-weight-bold .text-${dccstateStyle}`,
            [state.pack.name]
        ),
        div('.card-body', [
            p('.card-text .d-flex .justify-content-between ', [
                span(`transfer status: ${state.dccstate} (${state.botstate})`),
                span(
                    `progress: ${sizeFormatter(state.bytes)} / ${sizeFormatter(
                        state.bytesTotal
                    )}`
                ),
                span(`time spent: ${duration(state.duration / 1000)}`),
                span(
                    `remote: ${state.pack.uname} @ ${state.pack.cname} on ${
                        state.pack.nname
                    } `
                )
            ]),
            div('.progress', [
                div(
                    `.progress-bar .progress-bar-striped .bg-${dccstateStyle} ${
                        state.dccstate == 'PROGRESS' ? '.progress-bar-animated' : ''
                    }`,
                    { style: { width: `${progress}%` } },
                    [`${state.pack.szf} (${progress}%)`]
                )
            ]),
            p('.mt-4 .d-flex .justify-content-between', [
                button('.btn .btn-primary .show-messages', ['messages']),
                button(
                    `.btn .btn-danger .cancel-transfer `,
                    { attrs: { disabled: state.botstate == 'EXIT' } },
                    ['cancel transfer']
                )
            ]),
            div(`.collapse${!!showMessages ? '.show' : ''} .messages`, [
                div('.card .card-body', [
                    !!state.messages ? pre(state.messages.map(x => `${x}\n`)) : null
                ])
            ])
        ])
    ]);
};

export default (state$, viewExpandedMode$, showMessages$) =>
    xs
        .combine(state$, viewExpandedMode$, showMessages$)
        .map(
            ([s, vmode, showMessages]) =>
                vmode ? expandedView(s, showMessages) : collapsedListItemView(s)
        );
