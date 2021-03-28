import { Component, OnInit } from '@angular/core';
import { ReviewMode } from '../../models/review.model';
import { SetRepositoryEntity } from '../../models/set-repository.model';
import { OperationStatus } from '../../models/operation-status.model';
import { SetRepositoryService } from '../../services/set-repository.service';
import { hshrink, vshrink } from '../../utils/animations';
import { SetRepositoryIndexEntity } from '../../models/set-repository-index.model';
import { minPromiseDuration } from '../../utils/promise-utils';
import { ServiceError } from '../../models/service-error.model';

@Component({
    selector: 'app-set-browse-view',
    templateUrl: './set-browse-view.component.html',
    styleUrls: ['./set-browse-view.component.scss'],
    animations: [vshrink(), hshrink()],
})
export class SetBrowseViewComponent implements OnInit {
    repositories: SetRepositoryEntity[] = [];
    repositoriesFetchStatus: OperationStatus = 'IDLE';
    activePublicRepositoryId: string;
    repositoryIndexFetchStatus: OperationStatus = 'IDLE';
    repositoryIndex: SetRepositoryIndexEntity;
    indexFetchErrorReason: string;
    indexFetchErrorDetails: string;

    get activeRepository(): SetRepositoryEntity {
        return this.repositories?.find(
            (r) => r.publicId === this.activePublicRepositoryId
        );
    }

    constructor(private setRepositoryService: SetRepositoryService) {}

    ngOnInit(): void {
        this.fetchRepositories();
    }

    asReviewMode(mode: string) {
        return mode as ReviewMode;
    }

    async fetchRepositories() {
        if (this.repositoriesFetchStatus === 'IN_PROGRESS') return;
        this.repositories = [];
        this.activePublicRepositoryId = null;
        this.repositoriesFetchStatus = 'IN_PROGRESS';
        try {
            this.repositories = await minPromiseDuration(
                this.setRepositoryService.getSetRepositories(),
                400
            );
            if (this.repositories.length)
                this.selectRepository(this.repositories[0]);
            this.repositoriesFetchStatus = 'SUCCESS';
        } catch (e) {
            this.repositoriesFetchStatus = 'ERROR';
            console.error(e);
        }
    }

    async selectRepository(repository: SetRepositoryEntity) {
        this.activePublicRepositoryId = repository.publicId;
        await this.fetchRepositoryIndex();
    }

    async fetchRepositoryIndex() {
        if (!this.activeRepository) return;
        this.repositoryIndexFetchStatus = 'IN_PROGRESS';
        this.indexFetchErrorReason = null;
        this.indexFetchErrorDetails = null;
        this.repositoryIndex = null;
        const fetchPublicId = this.activeRepository.publicId;
        try {
            const index = await minPromiseDuration(
                this.setRepositoryService.getSetRepositoryIndex(
                    this.activeRepository.id
                ),
                400
            );
            if (index.publicId !== this.activeRepository?.publicId) return;
            this.repositoryIndex = index;
            this.repositoryIndexFetchStatus = 'SUCCESS';
        } catch (e) {
            if (this.activePublicRepositoryId === fetchPublicId) {
                this.repositoryIndexFetchStatus = 'ERROR';
                if (e instanceof ServiceError) {
                    switch (e.code) {
                        case 'SERVICE_UNAVAILABLE':
                            this.indexFetchErrorReason =
                                'The servers could not be reached. Are you sure you are connected to the internet? Please try again later.';
                            return;
                        case 'REPOSITORY_NOT_FOUND':
                            this.indexFetchErrorReason =
                                'The repository index could not be found. Please contact your repository administrator.';
                            return;
                        case 'SET_NOT_OWNED':
                            this.indexFetchErrorReason =
                                'You do not have permission to load an index for this set. You could try removing it and adding it back.';
                            return;
                        case 'REPOSITORY_UNAVAILABLE':
                            this.indexFetchErrorReason =
                                'The repository could not be reached, likely due to it not being online. Please try again later.';
                            return;
                        case 'REPOSITORY_ERROR':
                            this.indexFetchErrorReason =
                                'The repository gave an invalid response. Please contact your repository administrator.';
                            this.indexFetchErrorDetails = e.description;
                            return;
                        case 'REPOSITORY_INVALID_INDEX':
                            this.indexFetchErrorReason =
                                'The repository gave an invalid response. Please contact your repository administrator.';
                            this.indexFetchErrorDetails =
                                'Validation errors:\n\n' +
                                JSON.stringify(e.data, null, 2);
                            return;
                        case 'REPOSITORY_UNKNOWN_ERROR':
                            this.indexFetchErrorReason = e.description;
                            return;
                    }
                }
                this.indexFetchErrorReason =
                    'An unknown error occurred. Please contact a developer.';
            }
            console.error(e);
        }
    }
}
