import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SnackbarOptions {
    text?: string;
    timeout?: number;
    tapToDismiss?: boolean;
    action?: {
        label: string;
        onTap: (snackbar: Snackbar) => void;
    };
}

const DEFAULT_OPTIONS: SnackbarOptions = {
    text: '',
    timeout: 4000,
    tapToDismiss: false,
};

export class Snackbar {
    id: string;
    creationTime: Date;

    constructor(
        public options: SnackbarOptions,
        private service: SnackbarService
    ) {
        this.id = uuid();
        this.creationTime = new Date();
    }

    dismiss() {
        this.service.dismissSnackbar(this.id);
    }
}

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    private readonly _snackbars: BehaviorSubject<
        Snackbar[]
    > = new BehaviorSubject<Snackbar[]>([]);
    public readonly snackbars: Observable<
        Snackbar[]
    > = this._snackbars.asObservable();

    constructor() {}

    showSnackbar(options: SnackbarOptions): Snackbar {
        options = { ...DEFAULT_OPTIONS, ...options };
        const snackbar = new Snackbar(options, this);
        this._snackbars.next([...this._snackbars.value, snackbar]);
        return snackbar;
    }

    dismissSnackbar(id: string) {
        this._snackbars.next(
            this._snackbars.value.filter((snackbar) => snackbar.id !== id)
        );
    }

    trackSnackbarBy(index: number, item: Snackbar) {
        return item.id;
    }
}
