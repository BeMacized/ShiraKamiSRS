import { Injectable } from '@angular/core';
import { CardDto, CreateCardDto, UpdateCardDto } from '../models/card.model';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppSettingsService } from '../services/app-settings.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class CardRepositoryService {
    constructor(
        private appSettings: AppSettingsService,
        private http: HttpClient
    ) {}

    public getCard(setId: string, cardId: string): Observable<CardDto> {
        return this.getApiUrl(`/sets/${setId}/cards/${cardId}`).pipe(
            switchMap((url) => this.http.get<CardDto>(url))
        );
    }

    public createCard(card: CreateCardDto): Observable<CardDto> {
        return this.getApiUrl(`/sets/${card.setId}/cards`).pipe(
            switchMap((url) => this.http.post<CardDto>(url, card))
        );
    }

    public updateCard(card: UpdateCardDto): Observable<CardDto> {
        return this.getApiUrl(`/sets/${card.setId}/cards/${card.id}`).pipe(
            switchMap((url) => this.http.put<CardDto>(url, card))
        );
    }

    public deleteCard(setId: string, id: string): Observable<void> {
        return this.getApiUrl(`/sets/${setId}/cards/${id}`).pipe(
            switchMap((url) => this.http.delete<void>(url))
        );
    }

    private getApiUrl(resource: string) {
        return this.appSettings.appSettings.pipe(
            take(1),
            map(
                (appSettings) =>
                    `${appSettings.apiBaseUrl}${
                        resource.startsWith('/') ? resource : '/' + resource
                    }`
            )
        );
    }
}
