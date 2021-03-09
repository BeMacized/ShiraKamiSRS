import { Injectable } from '@angular/core';
import { LessonRepositoryService } from '../repositories/lesson-repository.service';
import { LessonEntity, LessonSetDto } from '../models/lesson.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';

@Injectable({
    providedIn: 'root',
})
export class LessonService {
    constructor(private lessonRepository: LessonRepositoryService) {}

    public async getLessons(
        options: Partial<{ setId: string; limit: number }>
    ): Promise<{ total: number; lessons: LessonEntity[] }> {
        try {
            const lessonSet: LessonSetDto = await this.lessonRepository
                .getLessons(options.setId, options.limit)
                .toPromise();
            return {
                total: lessonSet.total,
                lessons: lessonSet.lessons.map((l) =>
                    LessonEntity.fromDto(l, lessonSet.cards, lessonSet.sets)
                ),
            };
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw e;
        }
    }
}
