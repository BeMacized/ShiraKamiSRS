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
import { fade, hshrink, vshrink } from '../../utils/animations';
import { ReviewEntity, ReviewMode } from '../../models/review.model';
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
    viewedStages: LessonStage[];
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
type InputFeedback = 'CORRECT' | 'INCORRECT' | 'IGNORED';
type LessonStage = 'ENGLISH' | 'JAPANESE';

@Component({
    selector: 'app-lesson-review-view',
    templateUrl: './lesson-review-view.component.html',
    styleUrls: ['./lesson-review-view.component.scss'],
    animations: [fade(), hshrink(), vshrink()],
})
export class LessonReviewViewComponent implements OnInit, OnDestroy {
    console = console;
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
    lessonStages: LessonStage[] = ['JAPANESE', 'ENGLISH']; // Can be changed later for order preferences
    lessonStage: LessonStage;
    inputStage: InputStage;
    inputFeedback: InputFeedback;
    keyboardUnlisten: KeyboardUnlisten;

    answer = '';
    @ViewChild('answerInput') answerInputEl: ElementRef;
    answerShown = false;

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
                Enter: (event) => {
                    event.preventDefault();
                    void this.onEnterKey(event);
                },
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
            // Return to dashboard if no lessons are available
            if (!lessonSet.lessons.length) {
                await this.router.navigate(['dashboard']);
                return;
            }
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
                .forEach((card) =>
                    pages.push({ type: 'LESSON', card, viewedStages: [] })
                );
            // Add lesson input pages
            shuffle(lessonSet.lessons.slice()).forEach((l) =>
                pages.push({
                    type: 'LESSON_INPUT',
                    card: l.card,
                    mode: l.mode,
                })
            );
            // Reset stats
            this.itemsCorrect = 0;
            this.itemsInSession = lessonSet.lessons.length;
            this.totalItemsRemaining = lessonSet.total;
            // Set pages & current page
            this.pages = pages;
            this.pageIndex = 0;
            this.loadStatus = 'SUCCESS';
        } catch (e) {
            console.error(e);
            this.loadStatus = 'ERROR';
            await this.router.navigate(['dashboard']);
            return;
        }
    }

    async loadReviews() {
        if (this.loadStatus === 'IN_PROGRESS') return;
        this.loadStatus = 'IN_PROGRESS';
        try {
            // Fetch reviews
            const reviews = await this.reviewService.getAvailableReviews({
                setId: this.setId,
            });
            // Return to dashboard if no reviews are available
            if (!reviews.length) {
                await this.router.navigate(['dashboard']);
                return;
            }
            // Build pages
            const pages: Page[] = [];
            // Add review pages
            shuffle(reviews.slice()).forEach((l: ReviewEntity) =>
                pages.push({
                    type: 'REVIEW',
                    score: 0,
                    card: l.card,
                    mode: l.mode,
                    reviewId: l.id,
                })
            );
            // Reset stats
            this.itemsCorrect = 0;
            this.itemsInSession = reviews.length;
            this.totalItemsRemaining = reviews.length;
            // Set pages & current page
            this.pages = pages;
            this.pageIndex = 0;
            this.loadStatus = 'SUCCESS';
        } catch (e) {
            console.error(e);
            this.loadStatus = 'ERROR';
            await this.router.navigate(['dashboard']);
            return;
        }
    }

    async nextLesson() {
        // If we're not on a lesson, we're not gonna do anything
        if (!this.page || this.page.type !== 'LESSON') return;
        // If we have not yet seen all translations, show the next translation
        if (this.page.viewedStages.length < this.lessonStages.length) {
            this.setLessonStage(
                this.lessonStages.find(
                    (s) => !(this.page as LessonPage).viewedStages.includes(s)
                )
            );
            return;
        }
        // Otherwise, actually move to the next lesson
        if (this.pageIndex < this.pages.length - 1) {
            // Get the next lesson with unseen lesson stages
            const nextPage =
                this.pages
                    .slice(this.pageIndex + 1)
                    .find(
                        (p) =>
                            p.type === 'LESSON' &&
                            p.viewedStages.length < this.lessonStages.length
                    ) ??
                // or just return the next non-lesson page if there's none
                this.pages
                    .slice(this.pageIndex + 1)
                    .find((p) => p.type !== 'LESSON');
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
                this.pageIndex = this.pages.indexOf(nextPage);
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

    async processUserInput() {
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
        // Process the feedback
        this.inputFeedback = result.passing ? 'CORRECT' : 'INCORRECT';
        this.inputStage = 'FEEDBACK';
        this.answerInputEl.nativeElement.blur();
        if (result.passing)
            this.answerInputEl.nativeElement.value = result.correctAnswer;

        if (result.passing && this.pageIndex === this.pages.length - 1)
            // Immediately dismiss feedback if this is the last page and the answer was correct
            await this.processInputFeedback();
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

    async processInputFeedback() {
        if (this.inputStage !== 'FEEDBACK') return;
        // Process input feedback
        if (this.page.type === 'REVIEW') {
            if (this.inputFeedback === 'CORRECT') {
                if (this.page.score >= 0) this.page.score = 1;
                this.itemsCorrect++;
                this.totalItemsRemaining--;
            } else if (this.inputFeedback === 'INCORRECT') {
                this.page.score--;
            }
        } else if (this.page.type === 'LESSON_INPUT') {
            if (this.inputFeedback === 'CORRECT') {
                this.itemsCorrect++;
                this.totalItemsRemaining--;
            }
        }
        // Upload feedback once the correct answer is given
        if (this.inputFeedback === 'CORRECT') {
            await this.uploadFeedback(
                this.page as LessonInputPage | ReviewPage
            );
        }
        // Move to the next item
        switch (this.inputFeedback) {
            case 'CORRECT':
                // Go to next page if it exists
                if (this.pageIndex < this.pages.length - 1) {
                    this.pageIndex++;
                }
                // Otherwise, we're done
                else await this.finishLessons();
                break;
            case 'IGNORED':
            case 'INCORRECT':
                // Move the lesson somewhere further down the queue
                const newIndex =
                    this.pageIndex +
                    Math.floor(
                        Math.min(this.pages.length - this.pageIndex, 10) *
                            Math.random()
                    ) +
                    1;
                this.pages.splice(
                    newIndex,
                    0,
                    ...this.pages.splice(this.pageIndex, 1)
                );
                // Call page load manually since the page index does not actually change.
                this.onPageLoad();
                break;
        }
    }

    async finishLessons() {
        const modalData: ConfirmationModalInput =
            this.totalItemsRemaining > 0
                ? {
                      title: 'Lessons complete',
                      message: `You have more lessons available. Do you want to continue doing more lessons?`,
                      cancelText: `No, stop here`,
                      confirmText: `Yes, do more`,
                      pressEnterConfirm: false,
                  }
                : {
                      title: 'Lessons complete',
                      message: `There are no more lessons to do!`,
                      confirmText: `Go to dashboard`,
                      showCancel: false,
                      pressEnterConfirm: false,
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

    async onEnterKey(event?: Event) {
        if (!this.page) return;
        switch (this.page.type) {
            case 'LESSON':
                await this.nextLesson();
                break;
            case 'REVIEW':
            case 'LESSON_INPUT':
                if (this.inputStage === 'INPUT') {
                    if (
                        !event ||
                        event instanceof MouseEvent ||
                        (event instanceof KeyboardEvent &&
                            document.activeElement ===
                                this.answerInputEl?.nativeElement)
                    ) {
                        await this.processUserInput();
                    }
                } else if (this.inputStage === 'FEEDBACK') {
                    await this.processInputFeedback();
                }
                break;
        }
    }

    private onPageLoad() {
        const page = this.pages[this._pageIndex];
        if (!page) return;
        this.answerShown = false;
        if (page.type === 'REVIEW' || page.type === 'LESSON_INPUT') {
            requestAnimationFrame(() => {
                this.answerInputEl.nativeElement.focus();
                this.answerInputEl.nativeElement.value = this.answer = '';
            });
            this.inputFeedback = null;
            this.inputStage = 'INPUT';
        } else if (page.type === 'LESSON') {
            this.setLessonStage(
                this.lessonStages.find(
                    (s) => !(this.page as LessonPage).viewedStages.includes(s)
                ) ?? this.lessonStages[0]
            );
        }
    }

    setLessonStage(stage: LessonStage) {
        if (this.page.type !== 'LESSON') return;
        this.lessonStage = stage;
        if (!this.page.viewedStages.includes(stage))
            this.page.viewedStages.push(stage);
    }

    get canIgnoreAnswer() {
        return (
            this.page?.type === 'REVIEW' &&
            this.inputStage === 'FEEDBACK' &&
            this.inputFeedback === 'INCORRECT'
        );
    }

    get canToggleAnswer() {
        return (
            this.answerShown ||
            (this.inputStage === 'FEEDBACK' &&
                (this.page?.type === 'LESSON_INPUT' ||
                    this.page?.type === 'REVIEW'))
        );
    }

    ignoreAnswer() {
        if (!this.canIgnoreAnswer) return;
        this.inputFeedback = 'IGNORED';
    }
}
