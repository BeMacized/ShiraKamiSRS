import {
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { DomComponent } from '../../services/dom.service';
import { interval, Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-safe-popup-base',
    templateUrl: './safe-popup-base.component.html',
    styleUrls: ['./safe-popup-base.component.scss'],
})
export class SafePopupBaseComponent<T> implements OnInit, OnDestroy {
    public __DOM_COMPONENT: DomComponent<T>;

    private _position: [number, number] = [0, 0];
    private _destroy$: Subject<void> = new Subject<void>();

    protected _closable = false;

    private safetyPadding = 10;

    @HostBinding('style.left') get styleLeft() {
        return this._position[0] + 'px';
    }
    @HostBinding('style.top') get styleTop() {
        return this._position[1] + 'px';
    }
    @HostBinding('style.position') get stylePosition() {
        return 'absolute';
    }

    constructor(
        protected elementRef: ElementRef,
        private sanitizer: DomSanitizer
    ) {}

    set origin(value: [number, number]) {
        setTimeout(() => {
            const width = this.elementRef.nativeElement.clientWidth;
            this._position[0] = value[0] - width / 2;
            this._position[1] = value[1];
            this.ensureSafePosition();
        }, 0);
    }

    ngOnInit(): void {
        // Allow popup to close itself after a bit, to prevent it closing itself upon opening
        setTimeout(() => (this._closable = true), 100);
        // Have popup move itself to a safer position if needed continuously
        interval(100)
            .pipe(takeUntil(this._destroy$))
            .subscribe(this.ensureSafePosition);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
    }

    @HostListener('document:click', ['$event'])
    clickOutside($event: MouseEvent) {
        if (
            this._closable &&
            !this.elementRef.nativeElement.contains($event.target)
        ) {
            $event.stopImmediatePropagation();
            this.__DOM_COMPONENT.remove();
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.__DOM_COMPONENT.remove();
    }

    private ensureSafePosition = () => {
        setTimeout(() => {
            // Parameters
            let left = this._position[0];
            let top = this._position[1];
            const width = this.elementRef.nativeElement.clientWidth;
            const height = this.elementRef.nativeElement.clientHeight;
            // Calculate new position if needed
            if (top < this.safetyPadding) top = this.safetyPadding;
            if (left < this.safetyPadding) left = this.safetyPadding;
            if (top + height > window.innerHeight - this.safetyPadding)
                top =
                    window.innerHeight -
                    this.safetyPadding -
                    this.elementRef.nativeElement.clientHeight;
            if (left + width > window.innerWidth - this.safetyPadding)
                left =
                    window.innerWidth -
                    this.safetyPadding -
                    this.elementRef.nativeElement.clientWidth;
            // Change position
            this._position[0] = left;
            this._position[1] = top;
        }, 10);
    };
}
