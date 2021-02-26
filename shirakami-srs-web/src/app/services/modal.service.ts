import { Injectable } from '@angular/core';
import { DomComponent, DomService } from './dom.service';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Modal } from '../utils/modal';
import {
    ConfirmationModalComponent,
    ConfirmationModalInput,
    ConfirmationModalOutput,
} from '../components/modals/confirmation-modal/confirmation-modal.component';

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

    alert(title: string, message: string) {
        this.showModal<
            ConfirmationModalComponent,
            ConfirmationModalInput,
            ConfirmationModalOutput
        >(ConfirmationModalComponent, {
            title,
            message,
            confirmText: 'OK',
            showCancel: false,
        });
    }
}
