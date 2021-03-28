import { Component, OnInit } from '@angular/core';
import { ReviewMode } from '../../models/review.model';
import { SetRepositoryEntity } from '../../models/set-repository.model';
import { OperationStatus } from '../../models/operation-status.model';
import { SetRepositoryService } from '../../services/set-repository.service';
import { vshrink } from '../../utils/animations';

@Component({
    selector: 'app-set-browse-view',
    templateUrl: './set-browse-view.component.html',
    styleUrls: ['./set-browse-view.component.scss'],
    animations: [vshrink()],
})
export class SetBrowseViewComponent implements OnInit {
    repositories: SetRepositoryEntity[] = [];
    repositoriesFetchStatus: OperationStatus = 'IDLE';

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
        this.repositoriesFetchStatus = 'IN_PROGRESS';
        try {
            this.repositories = await this.setRepositoryService.getSetRepositories();
            this.repositoriesFetchStatus = 'SUCCESS';
        } catch (e) {
            this.repositoriesFetchStatus = 'ERROR';
            console.error(e);
        }
    }
}
