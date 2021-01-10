import { Component, HostListener, OnInit } from '@angular/core';
import { Modal } from '../../../services/modal.service';
import { fade, fadeUp, triggerChildren } from '../../../utils/animations';

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
};

export type ConfirmationModalOutput = 'CANCELLED' | 'CONFIRMED';

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
    implements OnInit {
    input: ConfirmationModalInput = defaultInput;

    constructor() {
        super();
    }

    ngOnInit(): void {}

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        if (this.input.pressEscCancel) this.onCancel();
    }

    onCancel() {
        this.emit('CANCELLED');
        this.close();
    }

    onConfirm() {
        this.emit('CONFIRMED');
        this.close();
    }

    initModal(data: ConfirmationModalInput | undefined) {
        this.input = { ...defaultInput, ...data };
    }
}
