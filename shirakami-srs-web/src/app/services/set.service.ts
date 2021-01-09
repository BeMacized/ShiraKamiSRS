import { Injectable } from '@angular/core';
import { SetRepositoryService } from '../repositories/set-repository.service';
import { SetEntity, SetMode } from '../models/set.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';

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
        }
    }

    async createSet(name: string, modes: SetMode[]): Promise<SetEntity> {
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
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw e;
        }
    }
}
