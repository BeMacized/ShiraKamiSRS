import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
} from '@angular/core';
import {
    animate,
    animateChild,
    group,
    query,
    style,
    transition,
    trigger,
} from '@angular/animations';

export function smoothHeight(name = 'smoothHeight', length = '.2s ease') {
    return trigger('smoothHeight', [
        transition('void <=> *', [group([])]),
        transition(
            '* <=> *',
            [
                group([query('@*', [animateChild()], { optional: true })]),
                style({ height: '{{startHeight}}px' }),
                animate(length),
            ],
            {
                params: { startHeight: 0 },
            }
        ),
    ]);
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[smoothHeight]',
})
export class SmoothHeightDirective implements OnChanges, AfterViewInit {
    @Input()
    smoothHeight;

    pulse: boolean;
    startHeight: number;
    initialized = false;

    constructor(private element: ElementRef) {}

    @HostBinding('style.display') styleDisplay = 'block';
    @HostBinding('style.overflow') styleOverflow = 'hidden';
    @HostBinding('style.position') stylePosition = 'relative';

    @HostBinding('@smoothHeight')
    get animation() {
        return { value: this.pulse, params: { startHeight: this.startHeight } };
    }

    ngAfterViewInit() {
        this.initialized = true;
    }

    ngOnChanges(changes) {
        if (this.initialized) {
            const startHeight = this.element.nativeElement.clientHeight;
            setTimeout(() => {
                this.startHeight = startHeight;
                this.pulse = !this.pulse;
            });
        }
    }
}
