import {
    Component,
    Input,
    OnInit,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { ReviewEntity, ReviewMode } from '../../../models/review.model';
import moment from 'moment';
import { CollapsibleComponent } from '../collapsible/collapsible.component';
import { flatten } from '@angular/compiler';

@Component({
    selector: 'app-review-forecast',
    templateUrl: './review-forecast.component.html',
    styleUrls: ['./review-forecast.component.scss'],
})
export class ReviewForecastComponent {
    @ViewChildren(CollapsibleComponent)
    collapsibles: QueryList<CollapsibleComponent>;
    _days = 7;
    @Input() set days(value: number) {
        if (value < 1) return;
        this._days = value;
        this.buildData();
    }
    _reviews: ReviewEntity[] = [];
    @Input() set reviews(reviews: ReviewEntity[]) {
        if (!reviews) this._reviews = [];
        this._reviews = reviews;
        this.buildData();
    }
    dayItems: Array<{
        title: string;
        total: number;
        mod: number;
        hourItems: Array<{
            time: number;
            total: number;
            mod: number;
            barWidth: string;
        }>;
    }> = [];

    constructor() {}

    private buildData() {
        this.dayItems = [...Array(this._days).keys()]
            .map((i) => {
                const dayStart = moment().startOf('day').add(i, 'days');
                const dayReviews = this._reviews.filter((r) => {
                    const unix = moment(r.reviewDate).unix();
                    return (
                        unix >= dayStart.unix() &&
                        unix < dayStart.clone().add(1, 'day').unix()
                    );
                });
                return {
                    title: i === 0 ? 'Today' : dayStart.format('dddd'),
                    total: this._reviews.filter(
                        (r) =>
                            moment(r.reviewDate).unix() <
                            dayStart.clone().add(1, 'day').unix()
                    ).length,
                    mod: dayReviews.length,
                    hourItems: dayReviews.reduce((hourItems, review) => {
                        const hour = moment(review.reviewDate).startOf('hour');
                        const hourItem = hourItems.find(
                            (item) => item.time === hour.unix()
                        );
                        if (hourItem) {
                            hourItem.mod++;
                        } else {
                            hourItems.push({
                                time: hour.unix(),
                                total: this._reviews.filter(
                                    (r) =>
                                        moment(r.reviewDate)
                                            .startOf('hour')
                                            .unix() <= hour.unix()
                                ).length,
                                mod: 1,
                                barWidth: '0%',
                            });
                        }
                        return hourItems;
                    }, []),
                };
            })
            .filter((v) => !!v);
        const maxHourMod = Math.max(
            ...flatten(
                this.dayItems.map((dayItem) =>
                    dayItem.hourItems.map((hourItem) => hourItem.mod)
                )
            )
        );
        if (maxHourMod) {
            this.dayItems.forEach((dayItem) => {
                dayItem.hourItems.forEach((hourItem) => {
                    hourItem.barWidth =
                        Math.round((hourItem.mod / maxHourMod) * 100) + '%';
                });
            });
        }
        setTimeout(() => {
            this.collapsibles.forEach((collapsible, index) => {
                collapsible.collapsed =
                    index !== 0 || !this.dayItems[index].hourItems.length;
            });
        });
    }
}
