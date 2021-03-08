import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    crossFade,
    fade,
    fadeUp,
    hshrink,
    modalPage,
    noop,
    triggerChildren,
    vshrink,
} from '../../../utils/animations';
import { CardEntity } from '../../../models/card.model';
import { CardService } from '../../../services/card.service';
import { OperationStatus } from '../../../models/operation-status.model';
import { minPromiseDuration } from '../../../utils/promise-utils';
import { cloneDeep } from 'lodash';
import { Modal } from '../../../utils/modal';
import { ServiceError } from '../../../models/service-error.model';
import { Subject } from 'rxjs';
import { smoothHeight } from '../../../directives/smooth-height.directive';

export interface CreateEditCardModalInput {
    setId: string;
    card?: CardEntity;
}

type Page = 'FORM' | 'PROCESSING';

@Component({
    selector: 'app-create-edit-card-modal',
    templateUrl: './create-edit-card-modal.component.html',
    styleUrls: ['./create-edit-card-modal.component.scss'],
    animations: [
        triggerChildren('triggerModal', '@modal'),
        fade('bg', '0.4s ease'),
        fadeUp('modal', '0.4s ease'),
        smoothHeight('smoothHeight', '.4s ease'),
        modalPage('modalPage', '.4s ease'),
        vshrink(),
        crossFade(),
        hshrink(),
        noop(),
    ],
})
export class CreateEditCardModalComponent
    extends Modal<CreateEditCardModalInput, CardEntity>
    implements OnInit, AfterViewInit {
    readonly maxTranslations = 3;
    readonly maxOptionals = 5;

    createAnother = false;
    createOrUpdateStatus: OperationStatus = 'IDLE';
    errorMessage: string;
    setId: string;
    cardId: string;
    @ViewChild('englishInput') englishInput: ElementRef;
    @ViewChild('kanaInput') kanaInput: ElementRef;
    @ViewChild('kanjiInput') kanjiInput: ElementRef;
    enTranslations: string[] = [];
    enNote = '';
    jpTranslations: [string, string?][] = [];
    jpNote = '';
    englishError = '';
    kanjiError = '';
    kanaError = '';
    page: Page = 'FORM';
    activeTab: 'JAPANESE' | 'ENGLISH' = 'JAPANESE';
    englishInputValue = '';
    kanaInputValue = '';
    kanjiInputValue = '';

    get isEditing() {
        return !!this.cardId;
    }

    constructor(private cardService: CardService) {
        super();
    }

    ngOnInit(): void {}

    ngAfterViewInit() {
        setTimeout(() => {
            switch (this.activeTab) {
                case 'JAPANESE':
                    this.kanaInput.nativeElement.focus();
                    break;
                case 'ENGLISH':
                    this.englishInput.nativeElement.focus();
                    break;
            }
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
            this.enTranslations = data.card.value.enTranslations.slice();
            this.jpTranslations = cloneDeep(data.card.value.jpTranslations);
            this.enNote = data.card.value.enNote ?? '';
            this.jpNote = data.card.value.jpNote ?? '';
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.close();
    }

    async createOrUpdateCard() {
        if (this.createOrUpdateStatus === 'IN_PROGRESS') return;
        this.errorMessage = '';
        this.createOrUpdateStatus = 'IN_PROGRESS';
        this.page = 'PROCESSING';
        this.englishInput?.nativeElement?.blur();
        this.kanaInput?.nativeElement?.blur();
        this.kanjiInput?.nativeElement?.blur();
        try {
            const card = await minPromiseDuration(
                this.cardId
                    ? this.cardService.updateCardValues(
                          this.setId,
                          this.cardId,
                          {
                              enTranslations: this.enTranslations,
                              jpTranslations: this.jpTranslations,
                              enNote: this.enNote,
                              jpNote: this.jpNote,
                          }
                      )
                    : this.cardService.createCard(
                          this.setId,
                          this.enTranslations,
                          this.jpTranslations,
                          this.enNote,
                          this.jpNote
                      ),
                400
            );
            this.emit(card);
            this.createOrUpdateStatus = 'SUCCESS';
            if (this.createAnother) {
                this.enTranslations = [];
                this.jpTranslations = [];
                this.kanaInputValue = '';
                this.kanjiInputValue = '';
                this.englishInputValue = '';
                this.enNote = '';
                this.jpNote = '';
                setTimeout(() => {
                    this.activeTab = 'JAPANESE';
                    this.page = 'FORM';
                    setTimeout(() => this.kanaInput?.nativeElement?.focus());
                }, 1500);
            } else {
                setTimeout(() => this.close(), 1000);
            }
        } catch (e) {
            console.error(e);
            this.createOrUpdateStatus = 'ERROR';
            switch (e instanceof ServiceError ? e.code : '') {
                case 'CARD_LIMIT_EXCEEDED':
                    this.errorMessage =
                        'You have reached the maximum allowed number of cards per set. Please remove another card before creating a new one.';
                    break;
                case 'SERVICE_UNAVAILABLE':
                    this.errorMessage =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                default:
                    console.error(e);
                    this.errorMessage = this.cardId
                        ? 'An unknown error occurred while trying to update the card.'
                        : 'An unknown error occurred while trying to create the card.';
            }
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
        this.englishInputValue = '';
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
        this.kanaInputValue = '';
        this.kanjiInputValue = '';
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

    isLanguageState(
        language: 'JAPANESE' | 'ENGLISH',
        state: 'ERROR' | 'PENDING' | 'VALID'
    ): boolean {
        switch (language) {
            case 'JAPANESE':
                switch (state) {
                    case 'ERROR':
                        return !!(this.kanaError || this.kanjiError);
                    case 'PENDING':
                        return (
                            !this.kanaError &&
                            !this.kanjiError &&
                            !this.jpTranslations.length
                        );
                    case 'VALID':
                        return (
                            !this.kanaError &&
                            !this.kanjiError &&
                            !!this.jpTranslations.length
                        );
                }
                break;
            case 'ENGLISH':
                switch (state) {
                    case 'ERROR':
                        return !!this.englishError;
                    case 'PENDING':
                        return (
                            !this.englishError && !this.enTranslations.length
                        );
                    case 'VALID':
                        return (
                            !this.englishError && !!this.enTranslations.length
                        );
                }
                break;
        }
        return false;
    }

    setActiveTab(language: 'JAPANESE' | 'ENGLISH') {
        if (this.activeTab === language) return;
        this.activeTab = language;
    }
}
