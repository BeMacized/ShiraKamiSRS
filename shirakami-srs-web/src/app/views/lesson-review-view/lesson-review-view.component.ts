import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { CardEntity } from '../../models/card.model';
import { OperationStatus } from '../../models/operation-status.model';
import { LessonService } from '../../services/lesson.service';
import { fade, hshrink } from '../../utils/animations';
import { ReviewMode } from '../../models/review.model';
import {
    ConfirmationModalComponent,
    ConfirmationModalInput,
    ConfirmationModalOutput,
} from '../../components/modals/confirmation-modal/confirmation-modal.component';
import { ModalService } from '../../services/modal.service';
import { shuffle } from 'lodash';
import * as wanakana from 'wanakana';
import {
    KeyboardService,
    KeyboardUnlisten,
} from '../../services/keyboard.service';
import { ReviewService } from '../../services/review.service';
import { matchAnswer } from '../../utils/answer-matcher';

export type LessonReviewMode = 'LESSONS' | 'REVIEWS';

type PageType = 'LESSON' | 'LESSON_INPUT' | 'REVIEW';

abstract class BasePage {
    type: PageType;
    card: CardEntity;
}

class LessonPage extends BasePage {
    type: 'LESSON';
}

class LessonInputPage extends BasePage {
    type: 'LESSON_INPUT';
    mode: ReviewMode;
}

class ReviewPage extends BasePage {
    type: 'REVIEW';
    mode: ReviewMode;
    score: number;
    reviewId: string;
}

type Page = LessonPage | LessonInputPage | ReviewPage;
type InputStage = 'INPUT' | 'FEEDBACK';
type InputFeedback = 'CORRECT' | 'INCORRECT';

@Component({
    selector: 'app-lesson-review-view',
    templateUrl: './lesson-review-view.component.html',
    styleUrls: ['./lesson-review-view.component.scss'],
    animations: [fade(), hshrink()],
})
export class LessonReviewViewComponent implements OnInit, OnDestroy {
    mode: LessonReviewMode;
    setId: string;
    pages: Page[] = [];
    get page(): Page {
        return this.pages[this.pageIndex];
    }
    _pageIndex = 0;
    get pageIndex(): number {
        return this._pageIndex;
    }
    set pageIndex(value: number) {
        this._pageIndex = value;
        this.onPageLoad();
    }
    loadStatus: OperationStatus = 'IDLE';
    shakeInputAnimation = false;
    itemsCorrect = 0;
    itemsInSession = 0;
    totalItemsRemaining = 0;
    inputStage: InputStage = 'INPUT';
    inputFeedback: InputFeedback;
    keyboardUnlisten: KeyboardUnlisten;

    answer = '';
    @ViewChild('answerInput') answerInputEl: ElementRef;
    get enableIME(): boolean {
        if (
            !this.page ||
            (this.page.type !== 'LESSON_INPUT' && this.page.type !== 'REVIEW')
        )
            return false;
        return this.page.mode === 'enToJp' || this.page.mode === 'kanjiToKana';
    }

    get progressBarWidth(): string {
        if (!this.page) return '0%';
        switch (this.page.type) {
            case 'LESSON':
                return '0%';
            case 'REVIEW':
            case 'LESSON_INPUT':
                return (
                    Math.floor(
                        (this.itemsCorrect / this.itemsInSession) * 100
                    ) + '%'
                );
        }
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lessonService: LessonService,
        private modalService: ModalService,
        private keyboard: KeyboardService,
        private reviewService: ReviewService
    ) {}

    async ngOnInit() {
        this.keyboardUnlisten = this.keyboard.listen(
            {
                Enter: () => void this.onEnterKey(),
                ArrowRight: () => void this.onRightKey(),
                l: () => void this.onRightKey(),
                d: () => void this.onRightKey(),
                ArrowLeft: () => void this.onLeftKey(),
                h: () => void this.onLeftKey(),
                a: () => void this.onLeftKey(),
            },
            {
                priority: 0,
                inputs: true,
            }
        );
        await this.loadRouteData();
        switch (this.mode) {
            case 'LESSONS':
                await this.loadLessons();
                break;
            case 'REVIEWS':
                await this.loadReviews();
                break;
        }
    }

    ngOnDestroy() {
        if (this.keyboardUnlisten) this.keyboardUnlisten();
    }

    shakeInput() {
        this.shakeInputAnimation = false;
        requestAnimationFrame(() => (this.shakeInputAnimation = true));
    }

    async loadRouteData() {
        const [routeData, routeParamMap]: [Data, ParamMap] = await Promise.all([
            this.route.data.pipe(take(1)).toPromise(),
            this.route.paramMap.pipe(take(1)).toPromise(),
        ]);
        if (!routeData.mode) {
            await this.router.navigate(['dashboard']);
            return;
        }
        this.mode = routeData.mode;
        this.setId = routeParamMap.get('setId');
    }

    async loadLessons() {
        if (this.loadStatus === 'IN_PROGRESS') return;
        this.loadStatus = 'IN_PROGRESS';
        try {
            // Fetch lessons
            const lessonSet = await this.lessonService.getLessons({
                setId: this.setId,
                limit: 5,
            });
            // Build pages
            const pages: Page[] = [];
            // Add lesson pages
            lessonSet.lessons
                .reduce(
                    (acc, e) =>
                        acc.find((c) => c.id === e.card.id)
                            ? acc
                            : [...acc, e.card],
                    [] as CardEntity[]
                )
                .forEach((card) => pages.push({ type: 'LESSON', card }));
            // Add lesson input pages
            shuffle(lessonSet.lessons.slice()).forEach((l) =>
                pages.push({ type: 'LESSON_INPUT', card: l.card, mode: l.mode })
            );
            // Reset stats
            this.itemsCorrect = 0;
            this.itemsInSession = lessonSet.lessons.length;
            this.totalItemsRemaining = lessonSet.total;
            // Set pages & current page
            this.pages = pages;
            this.pageIndex = 0;
            // this.pageIndex = 8;
            this.loadStatus = 'SUCCESS';
        } catch (e) {
            console.error(e);
            this.loadStatus = 'ERROR';
            await this.router.navigate(['dashboard']);
            return;
        }
    }

    async loadReviews() {}

    async nextLesson() {
        if (!this.page || this.page.type !== 'LESSON') return;
        if (this.pageIndex < this.pages.length - 1) {
            const nextPage = this.pages[this.pageIndex + 1];
            if (nextPage.type === 'LESSON') this.pageIndex++;
            else if (nextPage.type === 'LESSON_INPUT') {
                const result = await this.modalService
                    .showModal<
                        ConfirmationModalComponent,
                        ConfirmationModalInput,
                        ConfirmationModalOutput
                    >(ConfirmationModalComponent, {
                        title: 'Lesson Quiz',
                        message: `Now that you have seen all cards, it's time to do your lessons. Do you want to start?`,
                        cancelText: `I need more time`,
                        confirmText: `Let's go!`,
                    })
                    .toPromise();
                if (!result) return;
                this.pageIndex++;
            }
        }
    }

    previousLesson() {
        if (!this.page || this.page.type !== 'LESSON') return;
        if (
            this.pageIndex > 0 &&
            this.pages[this.pageIndex - 1].type === 'LESSON'
        )
            this.pageIndex--;
    }

    goToLesson(index: number) {
        if (this.pages[index]?.type !== 'LESSON') return;
        this.pageIndex = index;
    }

    async processAnswer() {
        if (this.page.type !== 'LESSON_INPUT' && this.page.type !== 'REVIEW')
            return;
        // Check input for obvious correctable mistakes
        const input = this.answer.trim();
        // Empty input
        if (!input) return this.shakeInput();
        const tokens = (wanakana.tokenize(input, {
            detailed: true,
        }) as any) as Array<{ type: string; value: string }>;
        const compactTokens = (wanakana.tokenize(input, {
            detailed: true,
        }) as any) as Array<{ type: string; value: string }>;
        switch (this.page.mode) {
            case 'enToJp':
                break;
            case 'jpToEn':
                // No japanese for english-only response
                if (compactTokens.find((t) => t.type === 'ja'))
                    return this.shakeInput();
                break;
            case 'kanjiToKana':
                // No kanji for kana-only response
                if (tokens.find((t) => t.type === 'kanji'))
                    return this.shakeInput();
                break;
        }
        // Check the answer
        const result = matchAnswer(input, this.page.mode, this.page.card);
        console.log('RESULT', result, this.page.card);
        // Process the feedback
        this.inputFeedback = result.passing ? 'CORRECT' : 'INCORRECT';
        this.inputStage = 'FEEDBACK';
        this.answerInputEl.nativeElement.blur();
        if (result.passing) {
            switch (this.page.mode) {
                case 'enToJp':
                    this.answerInputEl.nativeElement.value =
                        this.page.card.value.kanji || this.page.card.value.kana;
                    break;
                case 'jpToEn':
                    this.answerInputEl.nativeElement.value = this.page.card.value.english;
                    break;
                case 'kanjiToKana':
                    this.answerInputEl.nativeElement.value = this.page.card.value.kana;
                    break;
            }
        }
        if (this.page.type === 'REVIEW') {
            if (result.passing) {
                if (this.page.score >= 0) this.page.score = 1;
            } else {
                this.page.score--;
            }
        } else if (this.page.type === 'LESSON_INPUT') {
            if (result.passing) {
                this.itemsCorrect++;
                this.totalItemsRemaining--;
            }
        }
        // Upload the score if needed
        if (result.passing) await this.uploadFeedback(this.page);
        // Immediately dismiss feedback if this is the last page
        if (result.passing && this.pageIndex === this.pages.length - 1)
            await this.dismissInputFeedback();
    }

    async uploadFeedback(page: ReviewPage | LessonInputPage) {
        switch (page.type) {
            case 'REVIEW':
                try {
                    await this.reviewService.submitReview(
                        page.reviewId,
                        page.score
                    );
                } catch (e) {
                    console.error('Could not submit review for card.', {
                        error: e,
                        card: page.card,
                        mode: page.mode,
                        score: page.score,
                    });
                }
                break;
            case 'LESSON_INPUT':
                try {
                    await this.reviewService.createReview(
                        page.card.id,
                        page.mode
                    );
                } catch (e) {
                    console.error('Could not create review for card.', {
                        error: e,
                        card: page.card,
                        mode: page.mode,
                    });
                }
                break;
        }
    }

    async dismissInputFeedback() {
        if (this.inputStage !== 'FEEDBACK') return;
        switch (this.inputFeedback) {
            case 'CORRECT':
                // Go to next page if it exists
                if (this.pageIndex < this.pages.length - 1) {
                    this.pageIndex++;
                }
                // Otherwise, we're done
                else await this.finishLessons();
                break;
            case 'INCORRECT':
                // Move the lesson somewhere further down the queue
                const newIndex =
                    this.pageIndex +
                    Math.floor(
                        (this.pages.length - this.pageIndex) * Math.random()
                    ) +
                    1;
                this.pages.splice(
                    newIndex,
                    0,
                    ...this.pages.splice(this.pageIndex, 1)
                );
                this.onPageLoad();
                break;
        }
    }

    async finishLessons() {
        const modalData =
            this.totalItemsRemaining > 0
                ? {
                      title: 'Lessons complete',
                      message: `You have more lessons available. Do you want to continue doing more lessons?`,
                      cancelText: `No, stop here`,
                      confirmText: `Yes, do more`,
                  }
                : {
                      title: 'Lessons complete',
                      message: `There are no more lessons to do!`,
                      confirmText: `Go to dashboard`,
                      showCancel: false,
                  };

        const result = await this.modalService
            .showModal<
                ConfirmationModalComponent,
                ConfirmationModalInput,
                ConfirmationModalOutput
            >(ConfirmationModalComponent, modalData)
            .toPromise();

        if (result && this.totalItemsRemaining > 0) {
            await this.loadLessons();
        } else {
            await this.router.navigate(['dashboard']);
        }
    }

    onLeftKey() {
        if (!this.page) return;
        switch (this.page.type) {
            case 'LESSON':
                this.previousLesson();
                break;
            case 'LESSON_INPUT':
                break;
            case 'REVIEW':
                break;
        }
    }

    async onRightKey() {
        if (!this.page) return;
        switch (this.page.type) {
            case 'LESSON':
                await this.nextLesson();
                break;
            case 'LESSON_INPUT':
                break;
            case 'REVIEW':
                break;
        }
    }

    async onEnterKey() {
        if (!this.page) return;
        switch (this.page.type) {
            case 'LESSON':
                await this.nextLesson();
                break;
            case 'REVIEW':
            case 'LESSON_INPUT':
                if (this.inputStage === 'INPUT') {
                    if (
                        document.activeElement ===
                        this.answerInputEl?.nativeElement
                    ) {
                        await this.processAnswer();
                    }
                } else {
                    await this.dismissInputFeedback();
                }
                break;
        }
    }

    private onPageLoad() {
        const page = this.pages[this._pageIndex];
        if (page && (page.type === 'REVIEW' || page.type === 'LESSON_INPUT')) {
            requestAnimationFrame(() => {
                this.answerInputEl.nativeElement.focus();
                this.answerInputEl.nativeElement.value = this.answer = '';
            });
            this.inputFeedback = null;
            this.inputStage = 'INPUT';
        }
    }
}
