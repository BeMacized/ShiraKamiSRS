import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import * as wanakana from 'wanakana';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[wanakana]',
})
export class WanakanaDirective implements AfterViewInit {
    enabled = false;
    initialized = false;
    @Input() set wanakana(value: boolean) {
        this.enabled = value;
        if (this.initialized) {
            if (value) {
                wanakana.bind(this.elementRef.nativeElement);
            } else {
                wanakana.unbind(this.elementRef.nativeElement);
            }
        }
    }

    @Output() wkInput: EventEmitter<string> = new EventEmitter<string>();

    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.enabled) {
                wanakana.bind(this.elementRef.nativeElement);
            }
            this.elementRef.nativeElement.addEventListener('input', () => {
                setTimeout(() => {
                    this.wkInput.emit(this.elementRef.nativeElement.value);
                });
            });
            this.initialized = true;
        });
    }
}
