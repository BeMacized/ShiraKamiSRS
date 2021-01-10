import { Injectable } from '@angular/core';
import { DomComponent, DomService } from './dom.service';
import { from, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export abstract class Modal<I = any, O = any> {
    private domComponent: DomComponent;
    protected _output: Subject<O> = new Subject<O>();

    public set __DOM_COMPONENT(component: DomComponent) {
        this.domComponent = component;
        component.on(
            'remove',
            () => (this._output.complete(), (this._output = null))
        );
    }

    protected emit = (value: O) => {
        this._output.next(value);
    };

    public abstract initModal(data?: I);

    public get output(): Observable<O> {
        return this._output.asObservable();
    }

    public close() {
        this.domComponent.remove();
    }
}

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    constructor(private domService: DomService) {}

    showModal<C extends Modal<I, O>, I = any, O = any>(
        child: new (...a: any[]) => C,
        input?: I
    ): Observable<O> {
        return from(
            new Promise<DomComponent<C>>((res, rej) => {
                setTimeout(() => {
                    const modal: DomComponent<C> = this.domService.appendComponentTo<C>(
                        'global-overlay-container',
                        child
                    );
                    modal.component.initModal(input);
                    res(modal);
                });
            })
        ).pipe(switchMap((modal: DomComponent<C>) => modal.component.output));
    }
}
