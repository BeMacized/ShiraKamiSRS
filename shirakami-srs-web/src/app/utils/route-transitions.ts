import { animate, group, query, style, transition } from '@angular/animations';

export function routeFadeUpPush(
    from: string,
    to: string,
    duration = '.25s ease'
) {
    return transition(`${from} => ${to}`, [
        group([
            query(
                ':enter, :leave',
                style({ position: 'fixed', width: '100%' }),
                {
                    optional: true,
                }
            ),
            query(
                ':enter',
                [
                    style({
                        transform: 'translateY(50%)',
                        opacity: 0,
                        'z-index': 1,
                    }),
                    animate(
                        duration,
                        style({ transform: 'translateY(0)', opacity: 1 })
                    ),
                ],
                { optional: true }
            ),
            query(
                ':leave',
                [
                    style({ 'z-index': 0 }),
                    animate(duration, style({ opacity: 0 })),
                ],
                { optional: true }
            ),
        ]),
    ]);
}

export function routeFadeUpPop(from: string, to: string, duration = '.25s ease') {
    return transition(`${from} => ${to}`, [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), {
            optional: true,
        }),
        group([
            query(
                ':enter',
                [
                    style({ opacity: 0, 'z-index': 0 }),
                    animate(duration, style({})),
                ],
                { optional: true }
            ),
            query(
                ':leave',
                [
                    style({
                        transform: 'translateY(0)',
                        opacity: 1,
                        'z-index': 1,
                    }),
                    animate(
                        duration,
                        style({ transform: 'translateY(50%)', opacity: 0 })
                    ),
                ],
                { optional: true }
            ),
        ]),
    ]);
}

export function routeSlidePush(
    from: string,
    to: string,
    duration = '.25s ease'
) {
    return transition(`${from} => ${to}`, [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), {
            optional: true,
        }),
        group([
            query(
                ':enter',
                [
                    style({ transform: 'translateX(100%)' }),
                    animate(duration, style({ transform: 'translateX(0%)' })),
                ],
                { optional: true }
            ),
            query(
                ':leave',
                [
                    style({ transform: 'translateX(0%)' }),
                    animate(
                        duration,
                        style({ transform: 'translateX(-100%)' })
                    ),
                ],
                { optional: true }
            ),
        ]),
    ]);
}

export function routeSlidePop(
    from: string,
    to: string,
    duration = '.25s ease'
) {
    return transition(`${from} => ${to}`, [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), {
            optional: true,
        }),
        group([
            query(
                ':enter',
                [
                    style({ transform: 'translateX(-100%)' }),
                    animate(duration, style({ transform: 'translateX(0%)' })),
                ],
                { optional: true }
            ),
            query(
                ':leave',
                [
                    style({ transform: 'translateX(0%)' }),
                    animate(duration, style({ transform: 'translateX(100%)' })),
                ],
                { optional: true }
            ),
        ]),
    ]);
}
