import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    fade,
    fadeUp,
    hshrink,
    triggerChildren,
    vshrink,
} from '../../../utils/animations';
import { Modal } from '../../../services/modal.service';
import { CardEntity } from '../../../models/card.model';
import { CardService } from '../../../services/card.service';
import { OperationStatus } from '../../../models/operation-status.model';
import { minPromiseDuration } from '../../../utils/promise-utils';

export interface CreateEditCardModalInput {
    setId: string;
    card?: CardEntity;
}

@Component({
    selector: 'app-create-edit-card-modal',
    templateUrl: './create-edit-card-modal.component.html',
    styleUrls: ['./create-edit-card-modal.component.scss'],
    animations: [
        triggerChildren('triggerModal', '@modal'),
        fade('bg', '0.4s ease'),
        fadeUp('modal', '0.4s ease'),
        vshrink(),
        hshrink(),
        fade(),
    ],
})
export class CreateEditCardModalComponent
    extends Modal<CreateEditCardModalInput, CardEntity>
    implements OnInit, AfterViewInit {
    englishWord = '';
    kanaWord = '';
    kanjiWord = '';
    createAnother = false;
    showStatusOverlay = false;
    createOrUpdateStatus: OperationStatus = 'IDLE';
    setId: string;
    cardId: string;

    @ViewChild('englishInput') englishInput: ElementRef;
    @ViewChild('kanaInput') kanaInput: ElementRef;
    @ViewChild('kanjiInput') kanjiInput: ElementRef;
    get isEditing() {
        return !!this.cardId;
    }

    constructor(private cardService: CardService) {
        super();
    }

    ngOnInit(): void {}

    ngAfterViewInit() {
        setTimeout(() => {
            this.englishInput.nativeElement.focus();
        });
    }

    initModal(data: CreateEditCardModalInput | undefined) {
        if (!data) {
            console.warn(
                'Attempted to open CreateCardModal without providing appropriate input'
            );
            this.close();
            return;
        }
        this.setId = data.setId;
        if (data.card) {
            this.cardId = data.card.id;
            this.englishWord = data.card.value.english || '';
            this.kanaWord = data.card.value.kana || '';
            this.kanjiWord = data.card.value.kanji || '';
            setTimeout(() => {
                this.englishInput.nativeElement.value = this.englishWord;
                this.kanaInput.nativeElement.value = this.kanaWord;
                this.kanjiInput.nativeElement.value = this.kanjiWord;
            });
        }
    }

    get isValidCardValues() {
        return (
            this.englishWord.length > 0 &&
            this.englishWord.length <= 255 &&
            this.kanaWord.length > 0 &&
            this.kanaWord.length <= 255 &&
            (!this.kanjiWord.length ||
                (this.kanjiWord.length > 0 && this.kanjiWord.length <= 255))
        );
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.close();
    }

    async createOrUpdateCard() {
        if (this.showStatusOverlay) return;
        this.createOrUpdateStatus = 'IN_PROGRESS';
        this.showStatusOverlay = true;
        this.englishInput.nativeElement.blur();
        this.kanaInput.nativeElement.blur();
        this.kanjiInput.nativeElement.blur();
        try {
            const card = await minPromiseDuration(
                this.cardId
                    ? this.cardService.updateCardValues(
                          this.setId,
                          this.cardId,
                          {
                              english: this.englishWord,
                              kana: this.kanaWord,
                              kanji: this.kanjiWord || undefined,
                          }
                      )
                    : this.cardService.createCard(this.setId, {
                          english: this.englishWord,
                          kana: this.kanaWord,
                          kanji: this.kanjiWord || undefined,
                      }),
                400
            );
            this.emit(card);
            this.createOrUpdateStatus = 'SUCCESS';
            if (this.createAnother) {
                setTimeout(() => {
                    this.resetForm();
                    this.englishInput.nativeElement.focus();
                    this.showStatusOverlay = false;
                }, 500);
            } else {
                setTimeout(() => this.close(), 1000);
            }
        } catch (e) {
            console.error(e);
            this.createOrUpdateStatus = 'ERROR';
            setTimeout(() => (this.showStatusOverlay = false), 1000);
        }
    }

    resetForm() {
        this.englishWord = '';
        this.kanaWord = '';
        this.kanjiWord = '';
        this.englishInput.nativeElement.value = this.englishWord;
        this.kanaInput.nativeElement.value = this.kanaWord;
        this.kanjiInput.nativeElement.value = this.kanjiWord;
    }
}
