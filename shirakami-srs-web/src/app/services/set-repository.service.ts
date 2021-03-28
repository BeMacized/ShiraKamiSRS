import { Injectable } from '@angular/core';
import { SetRepositoryRepositoryService } from '../repositories/set-repository-repository.service';
import { SetRepositoryEntity } from '../models/set-repository.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';

@Injectable({
    providedIn: 'root',
})
export class SetRepositoryService {
    constructor(
        private setRepositoryRepository: SetRepositoryRepositoryService
    ) {}

    public async getSetRepositories(): Promise<SetRepositoryEntity[]> {
        try {
            return await this.setRepositoryRepository
                .getSetRepositories()
                .toPromise();
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

    public async removeSetRepository(repositoryId: string): Promise<void> {
        try {
            await this.setRepositoryRepository
                .removeSetRepository(repositoryId)
                .toPromise();
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

    public async addSetRepository(
        indexUrl: string
    ): Promise<SetRepositoryEntity> {
        try {
            return await this.setRepositoryRepository
                .addSetRepository(indexUrl)
                .toPromise();
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                    case 403: // Forbidden (Max repositories reached)
                    case 502: // Gateway error (Issues with repository)
                    case 409: // Conflict (Repository already added)
                        if (e.error.error)
                            throw new ServiceError(e.error.error);
                        break;
                }
            }
            throw e;
        }
    }
}
