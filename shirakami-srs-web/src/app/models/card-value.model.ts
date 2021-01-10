export class CardValueEntity {
    public readonly english: string;
    public readonly kana: string;
    public readonly kanji?: string;

    static fromDto(dto: CardValueDto): CardValueEntity {
        return Object.assign(new CardValueEntity(), {
            english: dto.english,
            kana: dto.kana,
            kanji: dto.kanji,
        });
    }
}

export class CardValueDto {
    english: string;
    kana: string;
    kanji?: string;
}
