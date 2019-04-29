import { div, li, h5, p, pre, button } from '@cycle/dom';

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

export default state$ => {
    return state$.map(s => {
        const progress = !!s.bytesTotal
            ? (s.bytes / s.bytesTotal * 100).toFixed(1)
            : 0;
        const dccstateStyle = styleModifier(s.dccstate);

        return li(`.card .m-1 .border-${dccstateStyle}`, [
            div(`.card-header .font-weight-bold .text-${dccstateStyle}`, [s.pack.name]),
            div('.card-body', [
                p('.card-text', [
                    `transfer status: ${s.dccstate}`,
                    ' / ',
                    `time spent: ${duration(
                        (s.timestamp - s.startedTimestamp) / 1000
                    )}`,
                    ' / ',
                    `${s.pack.uname} @ ${s.pack.cname} on ${s.pack.nname} `
                ]),
                div('.progress', [
                    div(
                        `.progress-bar .progress-bar-striped .bg-${dccstateStyle} ${
                            s.dccstate == 'PROGRESS'
                                ? '.progress-bar-animated'
                                : ''
                        }`,
                        { style: { width: `${progress}%` } },
                        [`${s.pack.szf} (${progress}%)`]
                    )
                ]),
                p('.mt-4', [
                    button('.btn .btn-primary .showMessages', ['messages'])
                ]),
                div(`.collapse${!!s.showMessages ? '.show' : ''} .messages`, [
                    div('.card .card-body', [
                        !!s.messages ? pre(s.messages.map(x => `${x}\n`)) : null
                    ])
                ])
            ])
        ]);
    });
};
