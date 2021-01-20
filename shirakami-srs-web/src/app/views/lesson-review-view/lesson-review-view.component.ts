import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { debounceTime, map, take } from 'rxjs/operators';
import { CardEntity } from '../../models/card.model';
import { OperationStatus } from '../../models/operation-status.model';
import { LessonService } from '../../services/lesson.service';
import { fade, hshrink } from '../../utils/animations';
import { ReviewMode } from '../../models/review.model';
import { smoothHeight } from '../../directives/smooth-height.directive';
import { LessonEntity } from '../../models/lesson.model';
import {
    ConfirmationModalComponent,
    ConfirmationModalInput,
    ConfirmationModalOutput,
} from '../../components/modals/confirmation-modal/confirmation-modal.component';
import { ModalService } from '../../services/modal.service';
import { shuffle } from 'lodash';

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
}

type Page = LessonPage | LessonInputPage | ReviewPage;

@Component({
    selector: 'app-lesson-review-view',
    templateUrl: './lesson-review-view.component.html',
    styleUrls: ['./lesson-review-view.component.scss'],
    animations: [fade(), hshrink()],
})
export class LessonReviewViewComponent implements OnInit {
    mode: LessonReviewMode;
    setId: string;
    pages: Page[] = [];
    get page() {
        return this.pages[this.pageIndex];
    }
    _pageIndex = 0;
    get pageIndex(): number {
        return this._pageIndex;
    }
    set pageIndex(value: number) {
        this._pageIndex = value;
        this.configureAnswerInput();
    }
    loadStatus: OperationStatus = 'IDLE';
    lessonsCorrect = 0;
    lessonsRemaining = 0;
    totalLessonsRemaining = 0;
    shakeInputAnimation = false;

    @ViewChild('answerInput') answerInputEl: ElementRef;
    answer = '';
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
                const pages = this.pages.filter(
                    (p) => p.type === this.page.type
                );
                return (
                    Math.floor(
                        (pages.indexOf(this.page) / pages.length) * 100
                    ) + '%'
                );
        }
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lessonService: LessonService,
        private modalService: ModalService
    ) {}

    async ngOnInit() {
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

    shakeInput() {
        this.shakeInputAnimation = false;
        requestAnimationFrame(() => (this.shakeInputAnimation = true));
    }

    async loadRouteData() {
        const [routeData, routeParamMap] = await Promise.all([
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
            this.lessonsCorrect = 0;
            this.lessonsRemaining = lessonSet.lessons.length;
            this.totalLessonsRemaining = lessonSet.total;
            // Set pages & current page
            this.pages = pages;
            // this.pageIndex = 0;
            this.pageIndex = 8;
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
        if (
            this.pageIndex > 0 &&
            this.pages[this.pageIndex - 1].type === 'LESSON'
        )
            this.pageIndex--;
    }

    goToLesson(index: number) {
        this.pageIndex = index;
    }

    @HostListener('document:keyup.ArrowLeft')
    @HostListener('document:keyup.h')
    @HostListener('document:keyup.a')
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

    @HostListener('document:keyup.ArrowRight')
    @HostListener('document:keyup.l')
    @HostListener('document:keyup.d')
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

    @HostListener('document:keyup.enter')
    async onEnterKey() {
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

    private configureAnswerInput() {
        const page = this.pages[this._pageIndex];
        if (page && (page.type === 'REVIEW' || page.type === 'LESSON_INPUT')) {
            requestAnimationFrame(() => {
                this.answerInputEl?.nativeElement?.focus();
                if (page.mode === 'enToJp' || page.mode === 'kanjiToKana') {
                }
            });
        }
    }
}
