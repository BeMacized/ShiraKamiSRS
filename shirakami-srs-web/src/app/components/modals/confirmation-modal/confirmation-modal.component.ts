import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Modal } from '../../../services/modal.service';
import { fade, fadeUp, triggerChildren } from '../../../utils/animations';
import {
    KeyboardService,
    KeyboardUnlisten,
} from '../../../services/keyboard.service';

export type ConfirmationModalInput = Partial<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    showCancel: boolean;
    clickBgCancel: boolean;
    pressEscCancel: boolean;
    confirmButtonType: string;
    cancelButtonType: string;
    pressEnterConfirm: boolean;
}>;

const defaultInput: ConfirmationModalInput = {
    title: 'Confirm',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showCancel: true,
    clickBgCancel: true,
    pressEscCancel: true,
    confirmButtonType: 'btn-primary',
    cancelButtonType: 'btn-secondary',
    pressEnterConfirm: true,
};

export type ConfirmationModalOutput = boolean;

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss'],
    animations: [
        triggerChildren('triggerModal', '@modal'),
        fade('bg', '0.4s ease'),
        fadeUp('modal', '0.4s ease'),
    ],
})
export class ConfirmationModalComponent
    extends Modal<ConfirmationModalInput, ConfirmationModalOutput>
    implements OnInit, OnDestroy {
    input: ConfirmationModalInput = defaultInput;
    private keyboardUnlisten: KeyboardUnlisten;

    constructor(private keyboard: KeyboardService) {
        super();
    }

    ngOnInit(): void {
        this.keyboardUnlisten = this.keyboard.listen(
            {
                Escape: () => {
                    if (this.input.pressEscCancel) this.onCancel();
                },
                Enter: () => {
                    if (this.input.pressEnterConfirm) this.onConfirm();
                },
            },
            {
                priority: 100,
            }
        );
    }

    ngOnDestroy() {
        if (this.keyboardUnlisten) this.keyboardUnlisten();
    }

    onCancel() {
        this.emit(false);
        this.close();
    }

    onConfirm() {
        this.emit(true);
        this.close();
    }

    initModal(data: ConfirmationModalInput | undefined) {
        this.input = { ...defaultInput, ...data };
    }
}
