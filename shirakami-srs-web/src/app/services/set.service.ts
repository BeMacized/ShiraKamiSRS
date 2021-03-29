import { Injectable } from '@angular/core';
import { SetRepositoryService } from '../repositories/set-repository.service';
import { SetEntity, UpdateSetDto } from '../models/set.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';
import { ReviewMode } from '../models/review.model';
import { saveAs as saveFile } from 'file-saver';

@Injectable({
    providedIn: 'root',
})
export class SetService {
    constructor(private setRepository: SetRepositoryService) {}

    async getSets(): Promise<SetEntity[]> {
        try {
            const sets = await this.setRepository.getSets().toPromise();
            return sets.map((set) => SetEntity.fromDto(set));
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

    async getSet(setId: string, shallow = false): Promise<SetEntity> {
        try {
            const set = await this.setRepository
                .getSet(setId, shallow)
                .toPromise();
            return SetEntity.fromDto(set);
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

    async createSet(name: string, modes: ReviewMode[]): Promise<SetEntity> {
        try {
            const set = await this.setRepository
                .createSet({
                    name,
                    modes,
                })
                .toPromise();
            return SetEntity.fromDto(set);
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 403:
                        if (e?.error?.error)
                            throw new ServiceError(e.error.error);
                        break;
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw e;
        }
    }

    async updateSet(
        partialSet: Partial<SetEntity> & { id: string }
    ): Promise<SetEntity> {
        try {
            const set = await this.setRepository
                .updateSet({
                    ...(await this.getSet(partialSet.id)),
                    ...partialSet,
                } as UpdateSetDto)
                .toPromise();
            return SetEntity.fromDto(set);
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

    async updateSetModes(id: string, modes: ReviewMode[]): Promise<SetEntity> {
        return this.updateSet({ id, modes });
    }

    async updateSetName(id: string, name: string): Promise<SetEntity> {
        return this.updateSet({ id, name });
    }

    async deleteSet(id: string): Promise<void> {
        try {
            await this.setRepository.deleteSet(id).toPromise();
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

    async exportSet(
        setId: string,
        setName: string,
        includeReviews = false
    ): Promise<void> {
        try {
            const setData = await this.setRepository
                .exportSet(setId, includeReviews)
                .toPromise();
            saveFile(
                new Blob([setData], { type: 'text/plain;charset=utf-8' }),
                setName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json'
            );
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

    async importSet(
        fileData: any,
        includeReviews: boolean = false,
        dryRun: boolean = false
    ): Promise<SetEntity> {
        try {
            const set = await this.setRepository
                .importSet(fileData, includeReviews, dryRun)
                .toPromise();
            return SetEntity.fromDto(set);
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                    case 400:
                        throw new ServiceError('INVALID_IMPORT_DATA');
                }
            }
            throw e;
        }
    }
}
