import {
    animate,
    animateChild,
    group,
    keyframes,
    query,
    stagger,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

export function triggerChildren(name = 'triggerChildren') {
    return trigger(name, [
        transition('* => *', [
            group([query('@*', [animateChild()], { optional: true })]),
        ]),
    ]);
}
export function listItem(name = 'listItem', length = '.4s ease') {
    return trigger(name, [
        transition(':enter', [
            animate(
                length,
                keyframes([
                    style({
                        height: 0,
                        minHeight: 0,
                        opacity: 0,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        transform: 'translateX(-100%)',
                        offset: 0,
                    }),
                    style({
                        height: '!',
                        minHeight: '!',
                        marginTop: '!',
                        marginBottom: '!',
                        paddingTop: '!',
                        paddingBottom: '!',
                        opacity: '!',
                        transform: 'translateX(-100%)',
                        offset: 0.5,
                    }),
                    style({
                        transform: 'translateX(0)',
                        offset: 1,
                    }),
                ])
            ),
        ]),
        transition(':leave', [
            animate(
                length,
                keyframes([
                    style({
                        offset: 0,
                        transform: 'translateX(0)',
                    }),
                    style({
                        transform: 'translateX(100%)',
                        height: '!',
                        minHeight: '!',
                        marginTop: '!',
                        marginBottom: '!',
                        paddingTop: '!',
                        paddingBottom: '!',
                        opacity: '!',
                        offset: 0.5,
                    }),
                    style({
                        height: 0,
                        minHeight: 0,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        opacity: 0,
                        transform: 'translateX(100%)',
                        offset: 1,
                    }),
                ])
            ),
        ]),
    ]);
}

export function slidingPane(name = 'slidingPane', length = '.4s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ position: 'absolute', top: 0 }),
            animate(
                length,
                keyframes([
                    style({
                        height: 0,
                        minHeight: 0,
                        opacity: 0,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        transform: 'translateX(-100%)',
                        offset: 0,
                    }),
                    style({
                        height: '!',
                        minHeight: '!',
                        marginTop: '!',
                        marginBottom: '!',
                        paddingTop: '!',
                        paddingBottom: '!',
                        opacity: '!',
                        transform: 'translateX(-100%)',
                        offset: 0.5,
                    }),
                    style({
                        transform: 'translateX(0)',
                        offset: 1,
                    }),
                ])
            ),
        ]),
        transition(':leave', [
            style({ position: 'absolute', top: 0 }),
            animate(
                length,
                keyframes([
                    style({
                        offset: 0,
                        transform: 'translateX(0)',
                    }),
                    style({
                        transform: 'translateX(100%)',
                        height: '!',
                        minHeight: '!',
                        marginTop: '!',
                        marginBottom: '!',
                        paddingTop: '!',
                        paddingBottom: '!',
                        opacity: '!',
                        offset: 0.5,
                    }),
                    style({
                        height: 0,
                        minHeight: 0,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        opacity: 0,
                        transform: 'translateX(100%)',
                        offset: 1,
                    }),
                ])
            ),
        ]),
    ]);
}

export function preparedListItem(
    name = 'preparedListItem',
    length = '.4s ease'
) {
    return trigger(name, [
        state('true', style({})),
        state(
            'false',
            style({
                height: 0,
                minHeight: 0,
                opacity: 0,
                marginBottom: 0,
                marginTop: 0,
                paddingBottom: 0,
                paddingTop: 0,
                transform: 'translateX(-100%)',
            })
        ),
        transition(
            '* => true',
            animate(
                length,
                keyframes([
                    style({
                        height: 0,
                        minHeight: 0,
                        opacity: 0,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        transform: 'translateX(-100%)',
                        offset: 0,
                    }),
                    style({
                        height: '!',
                        minHeight: '!',
                        marginTop: '!',
                        marginBottom: '!',
                        paddingTop: '!',
                        paddingBottom: '!',
                        opacity: '!',
                        transform: 'translateX(-100%)',
                        offset: 0.5,
                    }),
                    style({
                        transform: 'translateX(0)',
                        offset: 1,
                    }),
                ])
            )
        ),
        transition(
            ':leave, true => false',
            animate(
                length,
                keyframes([
                    style({
                        offset: 0,
                        transform: 'translateX(0)',
                    }),
                    style({
                        transform: 'translateX(100%)',
                        height: '!',
                        minHeight: '!',
                        marginTop: '!',
                        marginBottom: '!',
                        paddingTop: '!',
                        paddingBottom: '!',
                        opacity: '!',
                        offset: 0.5,
                    }),
                    style({
                        height: 0,
                        minHeight: 0,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        opacity: 0,
                        transform: 'translateX(100%)',
                        offset: 1,
                    }),
                ])
            )
        ),
    ]);
}

export function fade(name = 'fade', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [style({ opacity: 0 }), animate(length)]),
        transition(':leave', [animate(length, style({ opacity: 0 }))]),
    ]);
}

export function fadeUp(name = 'fadeUp', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(44px)' }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({ opacity: 0, transform: 'translateY(44px)' })
            ),
        ]),
    ]);
}

export function fadeUpInv(name = 'fadeUpInv', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(44px)' }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({ opacity: 0, transform: 'translateY(-44px)' })
            ),
        ]),
    ]);
}

export function fadeLeft(name = 'fadeLeft', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateX(-44px)' }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({ opacity: 0, transform: 'translateX(-44px)' })
            ),
        ]),
    ]);
}

export function fadeRight(name = 'fadeRight', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateX(44px)' }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({ opacity: 0, transform: 'translateX(44px)' })
            ),
        ]),
    ]);
}

export function fadeDown(name = 'fadeDown', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(-44px)' }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({ opacity: 0, transform: 'translateY(-44px)' })
            ),
        ]),
    ]);
}

export function fadeDownInv(name = 'fadeDownInv', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(-44px)' }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({ opacity: 0, transform: 'translateY(44px)' })
            ),
        ]),
    ]);
}

export function zoomFadeShrink(name = 'zoomFadeShrink', length = '.5s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ opacity: 0, transform: 'scale(0)' }),
            animate(length),
        ]),
        transition(':leave', [
            animate(length, style({ opacity: 0, transform: 'scale(0)' })),
        ]),
    ]);
}

export function zoomFadeGrow(name = 'zoomFadeGrow', length = '.5s ease') {
    return trigger(name, [
        transition(':enter', [
            style({ opacity: 0, transform: 'scale(2)' }),
            animate(length),
        ]),
        transition(':leave', [
            animate(length, style({ opacity: 0, transform: 'scale(2)' })),
        ]),
    ]);
}

export function vshrink(name = 'vshrink', length = '.2s ease') {
    return trigger(name, [
        transition(':enter', [
            style({
                height: 0,
                minHeight: 0,
                opacity: 0,
                marginTop: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0,
            }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({
                    height: 0,
                    minHeight: 0,
                    opacity: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                })
            ),
        ]),
    ]);
}

export function vshrinkHidden(name = 'vshrinkHidden', length = '.2s ease') {
    return trigger(name, [
        transition(':enter', [
            style({
                height: 0,
                minHeight: 0,
                opacity: 0,
                marginTop: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0,
                overflow: 'hidden',
            }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({
                    height: 0,
                    minHeight: 0,
                    opacity: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    overflow: 'hidden',
                })
            ),
        ]),
    ]);
}

export function hshrink(name = 'hshrink', length = '.2s ease') {
    return trigger(name, [
        transition(':enter', [
            style({
                transform: 'scaleX(0)',
                width: 0,
                opacity: 0,
                'margin-left': 0,
                'margin-right': 0,
                'padding-left': 0,
                'padding-right': 0,
            }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({
                    transform: 'scaleX(0)',
                    width: 0,
                    opacity: 0,
                    'margin-left': 0,
                    'margin-right': 0,
                    'padding-left': 0,
                    'padding-right': 0,
                })
            ),
        ]),
    ]);
}

export function shrink(name = 'shrink', length = '.2s ease') {
    return trigger(name, [
        transition(':enter', [
            style({
                transform: 'scale(0)',
                width: 0,
                height: 0,
                opacity: 0,
                'margin-left': 0,
                'margin-right': 0,
                'margin-top': 0,
                'margin-bottom': 0,
                'padding-left': 0,
                'padding-right': 0,
                'padding-top': 0,
                'padding-bottom': 0,
            }),
            animate(length),
        ]),
        transition(':leave', [
            animate(
                length,
                style({
                    transform: 'scale(0)',
                    width: 0,
                    height: 0,
                    opacity: 0,
                    'margin-left': 0,
                    'margin-right': 0,
                    'margin-top': 0,
                    'margin-bottom': 0,
                    'padding-left': 0,
                    'padding-right': 0,
                    'padding-top': 0,
                    'padding-bottom': 0,
                })
            ),
        ]),
    ]);
}

export function fadeUpStaggered(
    name = 'fadeUpStaggered',
    length = '.15s ease',
    interval = 50
) {
    return trigger(name, [
        transition('* => *', [
            query(
                ':enter',
                [
                    style({ opacity: 0, transform: 'translateY(44px)' }),
                    stagger(interval, [animate(length)]),
                ],
                { optional: true }
            ),
            query(
                ':leave',
                [
                    stagger(interval, [
                        animate(
                            length,
                            style({ opacity: 0, transform: 'translateY(44px)' })
                        ),
                    ]),
                ],
                { optional: true }
            ),
        ]),
    ]);
}
