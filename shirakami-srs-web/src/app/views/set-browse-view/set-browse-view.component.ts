import { Component, OnInit } from '@angular/core';
import { ReviewMode } from '../../models/review.model';
import { SetRepositoryEntity } from '../../models/set-repository.model';
import { OperationStatus } from '../../models/operation-status.model';
import { SetRepositoryService } from '../../services/set-repository.service';
import { hshrink, noop, vshrink } from '../../utils/animations';
import {
    SetRepositoryIndexEntity,
    SetRepositoryIndexSetEntity,
} from '../../models/set-repository-index.model';
import { minPromiseDuration } from '../../utils/promise-utils';
import { ServiceError } from '../../models/service-error.model';
import { ModalService } from '../../services/modal.service';
import { SetService } from '../../services/set.service';
import { Router } from '@angular/router';
import {
    SetPreviewModalComponent,
    SetPreviewModalInput,
} from '../../components/modals/set-preview-modal/set-preview-modal.component';

@Component({
    selector: 'app-set-browse-view',
    templateUrl: './set-browse-view.component.html',
    styleUrls: ['./set-browse-view.component.scss'],
    animations: [vshrink(), hshrink(), noop()],
})
export class SetBrowseViewComponent implements OnInit {
    repositories: SetRepositoryEntity[] = [];
    repositoriesFetchStatus: OperationStatus = 'IDLE';
    activePublicRepositoryId: string;
    repositoryIndexFetchStatus: OperationStatus = 'IDLE';
    repositoryIndex: SetRepositoryIndexEntity;
    indexFetchErrorReason: string;
    indexFetchErrorDetails: string;

    setImportStatus: OperationStatus = 'IDLE';
    setImportRef: any;

    showAddRepositoryPane = false;
    addRepositoryUrl = '';
    addRepositoryStatus: OperationStatus = 'IDLE';
    addRepositoryError = '';
    addRepositoryErrorDetails = '';

    get activeRepository(): SetRepositoryEntity {
        return this.repositories?.find(
            (r) => r.publicId === this.activePublicRepositoryId
        );
    }

    constructor(
        private setRepositoryService: SetRepositoryService,
        private modalService: ModalService,
        private setService: SetService,
        private router: Router
    ) {}

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
        if (!repository) return;
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
            // Fetch index
            const index = await minPromiseDuration(
                this.setRepositoryService.getSetRepositoryIndex(
                    this.activeRepository.id
                ),
                400
            );
            // Patch index data into the already fetched repository in case it was updated
            const repository = this.repositories.find(
                (r) => r.publicId === index.publicId
            );
            if (repository) {
                Object.assign(repository, {
                    name: index.name,
                    imageUrl: index.imageUrl,
                });
            }
            // If the fetched data no longer belongs to the current active repository, stop here
            if (index.publicId !== this.activeRepository?.publicId) return;
            // Set the fetched index as the current index
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
                        case 'REPOSITORY_UNAVAILABLE':
                            this.indexFetchErrorReason =
                                'The repository could not be reached, likely due to it not being online. Please try again later.';
                            return;
                        case 'REPOSITORY_ERROR':
                            this.indexFetchErrorReason =
                                'The repository gave an invalid response. Please contact your repository administrator.';
                            this.indexFetchErrorDetails = e.description;
                            return;
                        case 'REPOSITORY_UNSUPPORTED_INDEX':
                            this.indexFetchErrorReason =
                                'The repository version is not yet supported by this version of ShiraKamiSRS.\nPlease check with an administrator, or contact your repository administrator if you believe this is in error.';
                            this.indexFetchErrorDetails = [
                                'Repository Index Version: ' +
                                    e.data?.indexVersion,
                                'ShiraKamiSRS Version: ' + e.data?.buildVersion,
                            ].join('\n');
                            return;
                        case 'REPOSITORY_INVALID_INDEX':
                            this.indexFetchErrorReason =
                                'The repository gave an invalid response. Please contact your repository administrator.';
                            this.indexFetchErrorDetails =
                                'Validation errors:\n\n' +
                                JSON.stringify(
                                    e.data?.validationErrors,
                                    null,
                                    2
                                );
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

    async importSet(setRef: any, repositorySet: SetRepositoryIndexSetEntity) {
        if (this.setImportStatus !== 'IDLE' && this.setImportStatus !== 'ERROR')
            return;
        this.setImportStatus = 'IN_PROGRESS';
        this.setImportRef = setRef;
        try {
            // Import set
            const set = await minPromiseDuration(
                this.setRepositoryService.importSet(
                    this.activeRepository,
                    repositorySet
                ),
                400
            );
            this.setImportStatus = 'SUCCESS';
            setTimeout(() => {
                this.router.navigate(['set', set.id]);
            }, 1000);
        } catch (e) {
            this.setImportStatus = 'ERROR';
            let importErrorMessage;
            switch (e instanceof ServiceError ? e.code : '') {
                case 'SERVICE_UNAVAILABLE':
                    importErrorMessage =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                case 'SET_DATA_UNFETCHABLE':
                    importErrorMessage =
                        'The set could not be fetched from the repository. Please contact the repository administrator.';
                    break;
                case 'INVALID_IMPORT_DATA':
                    importErrorMessage =
                        'The provided set could not be imported, as the data it contained was invalid.';
                    break;
                default:
                    console.error(e);
                    importErrorMessage =
                        'An unknown error occurred while trying to import the set.';
            }
            this.modalService.alert('Import Failed', importErrorMessage);
        }
    }

    previewSet(set: SetRepositoryIndexSetEntity) {
        this.modalService.showModal<
            SetPreviewModalComponent,
            SetPreviewModalInput,
            void
        >(SetPreviewModalComponent, {
            repository: this.activeRepository,
            set,
        });
    }

    async addRepository() {
        if (this.addRepositoryStatus === 'IN_PROGRESS') return;
        this.addRepositoryStatus = 'IN_PROGRESS';
        this.addRepositoryError = '';
        this.addRepositoryErrorDetails = '';
        try {
            const repo = await this.setRepositoryService.addSetRepository(
                this.addRepositoryUrl
            );
            this.addRepositoryStatus = 'SUCCESS';
            this.showAddRepositoryPane = false;
            this.addRepositoryUrl = '';
            await this.fetchRepositories();
            this.selectRepository(
                this.repositories.find((r) => r.id === repo.id)
            );
        } catch (e) {
            this.addRepositoryStatus = 'ERROR';
            switch (e instanceof ServiceError ? e.code : '') {
                case 'SERVICE_UNAVAILABLE':
                    this.addRepositoryError =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                case 'REPOSITORY_EXISTS':
                    this.addRepositoryError =
                        'This repository has already been added!';
                    return;
                case 'SET_REPOSITORY_LIMIT_EXCEEDED':
                    this.addRepositoryError =
                        'You have reached your maximum limit of allowed repositories. Please remove one before adding a new one.';
                    return;
                case 'REPOSITORY_UNAVAILABLE':
                    this.addRepositoryError =
                        'The repository could not be reached, likely due to it not being online. Please try again later.';
                    return;
                case 'REPOSITORY_ERROR':
                    this.addRepositoryError =
                        'The repository gave an invalid response. Please contact your repository administrator.';
                    this.indexFetchErrorDetails = e.description;
                    return;
                case 'REPOSITORY_UNSUPPORTED_INDEX':
                    this.addRepositoryError =
                        'The repository version is not yet supported by this version of ShiraKamiSRS.\nPlease check with an administrator, or contact your repository administrator if you believe this is in error.';
                    this.addRepositoryErrorDetails = [
                        'Repository Index Version: ' + e.data?.indexVersion,
                        'ShiraKamiSRS Version: ' + e.data?.buildVersion,
                    ].join('\n');
                    return;
                case 'REPOSITORY_INVALID_INDEX':
                    this.addRepositoryError =
                        'The repository gave an invalid response. Please contact your repository administrator.';
                    this.addRepositoryErrorDetails =
                        'Validation errors:\n\n' +
                        JSON.stringify(e.data?.validationErrors, null, 2);
                    return;
                case 'REPOSITORY_UNKNOWN_ERROR':
                    this.addRepositoryError = e.description;
                    return;
                default:
                    console.error(e);
                    this.addRepositoryError =
                        'An unknown error occurred while trying to add the repository.';
            }
        }
    }
}
