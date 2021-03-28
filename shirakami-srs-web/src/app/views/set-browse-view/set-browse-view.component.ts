import { Component, OnInit } from '@angular/core';
import { ReviewMode } from '../../models/review.model';
import { SetRepositoryEntity } from '../../models/set-repository.model';
import { OperationStatus } from '../../models/operation-status.model';
import { SetRepositoryService } from '../../services/set-repository.service';
import { hshrink, vshrink } from '../../utils/animations';
import { SetRepositoryIndexEntity } from '../../models/set-repository-index.model';
import { minPromiseDuration } from '../../utils/promise-utils';

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
            }
            console.error(e);
        }
    }
}
