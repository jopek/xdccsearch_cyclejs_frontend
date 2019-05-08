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

// <div class="card border-primary mb-3" style="max-width: 18rem;">
//     <div class="card-header">Header</div>
//     <div class="card-body text-primary">
//         <h5 class="card-title">Primary card title</h5>
//         <p class="card-text">
//             Some quick example text to build on the card title and make up the
//             bulk of the card's content.
//         </p>
//     </div>
// </div>;

const styleModifier = dccstate => {
    switch (dccstate) {
        case 'FINISH':
            return 'success';

        case 'PROGRESS':
            return 'info';

        case 'FAIL':
            return 'danger';

        default:
            return 'primary';
    }
};

const progressFn = s =>
    !!s.bytesTotal ? (s.bytes / s.bytesTotal * 100).toFixed(1) : 0;
const dccstateStyleFn = s => styleModifier(s.dccstate);

const collapsedListItemView = state => {
    const pack = state.pack;
    return a(
        `.transfer-item-toggle list-group-item .list-group-item-action .list-group-item-${dccstateStyleFn(
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
                span(
                    `mode: ${
                        state.botstate == 'RUN'
                            ? state.dccstate
                            : state.botstate
                    }`
                )
            ])
        ]
    );
};

const expandedView = (s, showMessages) => {
    const dccstateStyle = dccstateStyleFn(s);
    const progress = progressFn(s);
    return div(`.card .m-1 .border-${dccstateStyle}`, [
        div(
            `.transfer-item-toggle .card-header .font-weight-bold .text-${dccstateStyle}`,
            [s.pack.name]
        ),
        div('.card-body', [
            p('.card-text .d-flex .justify-content-between ', [
                span(`transfer status: ${s.dccstate} (${s.botstate})`),
                span(
                    `progress: ${sizeFormatter(s.bytes)} / ${sizeFormatter(
                        s.bytesTotal
                    )}`
                ),
                span(`time spent: ${duration(s.duration / 1000)}`),
                span(
                    `remote: ${s.pack.uname} @ ${s.pack.cname} on ${
                        s.pack.nname
                    } `
                )
            ]),
            div('.progress', [
                div(
                    `.progress-bar .progress-bar-striped .bg-${dccstateStyle} ${
                        s.dccstate == 'PROGRESS' ? '.progress-bar-animated' : ''
                    }`,
                    { style: { width: `${progress}%` } },
                    [`${s.pack.szf} (${progress}%)`]
                )
            ]),
            p('.mt-4 .d-flex .justify-content-between', [
                button('.btn .btn-primary .show-messages', ['messages']),
                button(
                    `.btn .btn-danger .cancel-transfer `,
                    { attrs: { disabled: s.botstate == 'EXIT' } },
                    ['cancel transfer']
                )
            ]),
            div(`.collapse${!!showMessages ? '.show' : ''} .messages`, [
                div('.card .card-body', [
                    !!s.messages ? pre(s.messages.map(x => `${x}\n`)) : null
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
