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
    readonly maxTranslations = 3;
    readonly maxOptionals = 5;

    createAnother = false;
    showStatusOverlay = false;
    createOrUpdateStatus: OperationStatus = 'IDLE';
    setId: string;
    cardId: string;
    @ViewChild('englishInput') englishInput: ElementRef;
    @ViewChild('kanaInput') kanaInput: ElementRef;
    @ViewChild('kanjiInput') kanjiInput: ElementRef;
    enTranslations: string[] = [];
    enTranslationNote = '';
    jpTranslations: [string, string?][] = [];
    jpTranslationNote = '';
    englishError = '';
    kanjiError = '';
    kanaError = '';
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
            // TODO: Load card values
        }
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
            // const card = await minPromiseDuration(
            //     this.cardId
            //         ? this.cardService.updateCardValues(
            //               this.setId,
            //               this.cardId,
            //               {
            //                   english: this.englishWord,
            //                   kana: this.kanaWord,
            //                   kanji: this.kanjiWord || undefined,
            //               }
            //           )
            //         : this.cardService.createCard(this.setId, {
            //               english: this.englishWord,
            //               kana: this.kanaWord,
            //               kanji: this.kanjiWord || undefined,
            //           }),
            //     400
            // );
            // this.emit(card);
            this.createOrUpdateStatus = 'SUCCESS';
            if (this.createAnother) {
                setTimeout(() => {
                    // this.englishInput.nativeElement.focus();
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

    async addEnTranslation(english: string) {
        this.resetErrors();
        if (this.enTranslations.length >= this.maxTranslations) return;
        english = english.trim();
        if (!english) return;
        try {
            await this.validateParentheses(english);
        } catch (e) {
            switch (e.code) {
                case 'NESTED_OPTIONALS':
                    this.englishError =
                        'You cannot have nested pairs of parentheses, as these represent optional parts of a translation.';
                    break;
                case 'NON_MATCHING_PARENTHESES':
                    this.englishError =
                        'One or more of your parentheses do not have a matching sibling.';
                    break;
                case 'MAX_OPTIONALS_EXCEEDED':
                    this.englishError = `You can only have a maximum of ${this.maxOptionals} optional groups per translation.`;
                    break;
            }
            return;
        }
        this.enTranslations.push(english);
        this.englishInput.nativeElement.value = '';
    }

    async addJpTranslation(kana: string, kanji: string) {
        this.resetErrors();
        if (this.jpTranslations.length >= this.maxTranslations) return;
        kana = kana.trim();
        if (!kana) return;
        try {
            await this.validateParentheses(kana);
        } catch (e) {
            switch (e.code) {
                case 'NESTED_OPTIONALS':
                    this.kanaError =
                        'You cannot have nested pairs of parentheses, as these represent optional parts of a translation.';
                    break;
                case 'NON_MATCHING_PARENTHESES':
                    this.kanaError =
                        'One or more of your parentheses do not have a matching sibling.';
                    break;
                case 'MAX_OPTIONALS_EXCEEDED':
                    this.kanaError = `You can only have a maximum of ${this.maxOptionals} optional groups per translation.`;
                    break;
            }
            return;
        }
        kanji = kanji.trim();
        try {
            await this.validateParentheses(kanji);
        } catch (e) {
            switch (e.code) {
                case 'NESTED_OPTIONALS':
                    this.kanjiError =
                        'You cannot have nested pairs of parentheses, as these represent optional parts of a translation.';
                    break;
                case 'NON_MATCHING_PARENTHESES':
                    this.kanjiError =
                        'One or more of your parentheses do not have a matching sibling.';
                    break;
                case 'MAX_OPTIONALS_EXCEEDED':
                    this.kanjiError = `You can only have a maximum of ${this.maxOptionals} optional groups per translation.`;
                    break;
            }
            return;
        }
        this.jpTranslations.push(kanji ? [kana, kanji] : [kana]);
        this.kanaInput.nativeElement.value = '';
        this.kanjiInput.nativeElement.value = '';
    }

    async validateParentheses(value: string) {
        let optionals = 0;
        let inOptional = false;
        for (let i = 0; i < value.length; i++) {
            switch (value.charAt(i)) {
                case '(':
                case '（':
                    if (inOptional) throw { code: 'NESTED_OPTIONALS' };
                    inOptional = true;
                    break;
                case ')':
                case '）':
                    if (!inOptional) throw { code: 'NON_MATCHING_PARENTHESES' };
                    optionals++;
                    if (optionals > this.maxOptionals)
                        throw { code: 'MAX_OPTIONALS_EXCEEDED' };
                    inOptional = false;
                    break;
            }
        }
        if (inOptional) throw { code: 'NON_MATCHING_PARENTHESES' };
    }

    resetErrors() {
        this.englishError = null;
        this.kanaError = null;
        this.kanjiError = null;
    }
}
