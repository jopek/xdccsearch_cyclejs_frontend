import { div, li, ul, pre } from '@cycle/dom';

const duration = seconds => {
    const numhours = Math.floor(seconds / 3600);
    const numminutes = Math.floor((seconds % 3600) / 60);
    const numseconds = Math.floor(seconds % 3600) % 60;

    const hstr = numhours > 0 ? `${numhours}h` : '';
    const mstr = numminutes > 0 ? `${numminutes}m` : '';

    return `${hstr}${mstr}${numseconds}s`;
};

export default state$ =>
    state$.map(s =>
        li('.item', [
            div('.name', [s.pack.name]),
            div('.state', [s.dccstate, ' ', s.botstate]),
            div('.size', [
                `${s.pack.szf} (${(s.bytes / s.bytesTotal * 100).toFixed(1)}%)`
            ]),
            div('.duration', [
                duration((s.timestamp - s.startedTimestamp) / 1000)
            ]),
            div('.connection', [
                `${s.pack.uname} @ ${s.pack.cname} on ${s.pack.nname} `
            ])
        ])
    );
