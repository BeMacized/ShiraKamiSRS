import { Observable, Subject } from 'rxjs';
import { DomComponent } from '../services/dom.service';

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
        if (this._output) this._output.next(value);
    };

    public abstract initModal(data?: I);

    public get output(): Observable<O> {
        return this._output.asObservable();
    }

    public close() {
        this.domComponent.remove();
    }
}
