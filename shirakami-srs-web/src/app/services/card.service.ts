import { Injectable } from '@angular/core';
import { CardValueEntity, CreateOrUpdateCardValueDto } from '../models/card-value.model';
import { CardRepositoryService } from '../repositories/card-repository.service';
import { CardEntity, UpdateCardDto } from '../models/card.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';

@Injectable({
    providedIn: 'root',
})
export class CardService {
    constructor(private cardRepository: CardRepositoryService) {
    }

    async createCard(
        setId: string,
        enTranslations: string[],
        jpTranslations: [string, string?][],
        enNote?: string,
        jpNote?: string,
    ): Promise<CardEntity> {
        try {
            const card = await this.cardRepository
                .createCard({
                    setId,
                    value: {
                        enTranslations,
                        jpTranslations,
                        enNote,
                        jpNote,
                    },
                })
                .toPromise();
            return CardEntity.fromDto(card);
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 403:
                        if (e.error.error) throw new ServiceError(e.error.error);
                        break;
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw e;
        }
    }

    async getCard(setId: string, cardId: string): Promise<CardEntity> {
        try {
            const card = await this.cardRepository
                .getCard(setId, cardId)
                .toPromise();
            return CardEntity.fromDto(card);
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

    async deleteCard(setId: string, id: string): Promise<void> {
        try {
            await this.cardRepository.deleteCard(setId, id).toPromise();
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

    async updateCard(
        partialCard: Partial<CardEntity> & { id: string; setId: string },
    ): Promise<CardEntity> {
        try {
            const card = await this.cardRepository
                .updateCard({
                    ...(await this.getCard(partialCard.setId, partialCard.id)),
                    ...partialCard,
                } as UpdateCardDto)
                .toPromise();
            return CardEntity.fromDto(card);
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

    updateCardValues(
        setId: string,
        cardId: string,
        value: CreateOrUpdateCardValueDto,
    ): Promise<CardEntity> {
        return this.updateCard({
            id: cardId,
            setId,
            value,
        } as Partial<CardEntity> & { id: string; setId: string });
    }
}
