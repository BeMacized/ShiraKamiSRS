import { Injectable } from '@angular/core';
import { SetRepositoryRepositoryService } from '../repositories/set-repository-repository.service';
import { SetRepositoryEntity } from '../models/set-repository.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';
import {
    SetRepositoryIndexEntity,
    SetRepositoryIndexSetEntity,
} from '../models/set-repository-index.model';
import { SetService } from './set.service';
import { SetEntity } from '../models/set.model';

@Injectable({
    providedIn: 'root',
})
export class SetRepositoryService {
    constructor(
        private setRepositoryRepository: SetRepositoryRepositoryService,
        private setService: SetService,
        private http: HttpClient
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

    public async getSetRepositoryIndex(
        repoId: string
    ): Promise<SetRepositoryIndexEntity> {
        try {
            return await this.setRepositoryRepository
                .getSetRepositoryIndex(repoId)
                .toPromise();
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                console.log('EYY', e);
                switch (e.status) {
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                    case 404:
                        throw new ServiceError('REPOSITORY_NOT_FOUND');
                    case 403:
                        throw new ServiceError('SET_NOT_OWNED');
                    case 502: // Gateway error (Issues with repository)
                        if (e.error.error)
                            throw new ServiceError(
                                e.error.error,
                                e.error.message,
                                e.error
                            );
                        break;
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
                            throw new ServiceError(
                                e.error.error,
                                e.error.message,
                                e.error
                            );
                        break;
                }
            }
            throw e;
        }
    }

    async importSet(
        repository: SetRepositoryEntity,
        set: SetRepositoryIndexSetEntity,
        dryRun: boolean = false
    ): Promise<SetEntity> {
        const setData = await this.getSetData(repository, set);
        return await this.setService.importSet(setData, false, dryRun);
    }

    async getSetData<T>(
        repository: SetRepositoryEntity,
        set: SetRepositoryIndexSetEntity
    ): Promise<T> {
        const setUrl = this.getSetUrl(repository.indexUrl, set.file);
        // Fetch set data
        try {
            return JSON.parse(
                await this.http
                    .get(setUrl, {
                        headers: { 'Content-Type': 'text/plain' },
                        responseType: 'text',
                    })
                    .toPromise()
            );
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw new ServiceError('SET_DATA_UNFETCHABLE');
        }
    }

    private getSetUrl(indexUrl: string, filePath: string): string {
        if (indexUrl.endsWith('.json')) {
            const url = new URL(indexUrl);
            const path = url.pathname.split('/');
            path.pop();
            url.pathname = path.join('/');
            indexUrl = url.toString();
        }
        indexUrl = indexUrl.substring(
            0,
            indexUrl.endsWith('/') ? indexUrl.length - 1 : indexUrl.length
        );
        return (
            indexUrl +
            '/' +
            filePath.substring(filePath.startsWith('/') ? 1 : 0)
        );
    }
}
