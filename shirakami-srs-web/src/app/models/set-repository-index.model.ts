import { ReviewMode } from './review.model';

export class SetRepositoryIndexEntity {
    public readonly publicId: string;
    public readonly version: 'v1';
    public readonly name: string;
    public readonly imageUrl?: string;
    public readonly homePageUrl?: string;
    public readonly sets: SetRepositoryIndexSetEntity[];

    static fromDto(dto: SetRepositoryIndexDto): SetRepositoryIndexEntity {
        if (!dto) return null;
        return Object.assign(new SetRepositoryIndexEntity(), {
            publicId: dto.publicId,
            version: dto.version,
            name: dto.name,
            imageUrl: dto.imageUrl,
            homePageUrl: dto.homePageUrl,
            sets: dto.sets?.map(SetRepositoryIndexSetEntity.fromDto),
        });
    }
}

export class SetRepositoryIndexSetEntity {
    public readonly name: string;
    public readonly exportVersion: string;
    public readonly description?: string;
    public readonly modes: ReviewMode[];
    public readonly cardCount: number;
    public readonly file: string;
    public readonly supported: boolean;

    static fromDto(dto: SetRepositoryIndexSetDto): SetRepositoryIndexSetEntity {
        if (!dto) return null;
        return Object.assign(new SetRepositoryIndexSetEntity(), {
            name: dto.name,
            exportVersion: dto.exportVersion,
            description: dto.description,
            modes: dto.modes,
            cardCount: dto.cardCount,
            file: dto.file,
            supported: dto.supported,
        });
    }
}

export class SetRepositoryIndexDto {
    public readonly publicId: string;
    public readonly version: 'v1';
    public readonly name: string;
    public readonly imageUrl?: string;
    public readonly homePageUrl?: string;
    public readonly sets: SetRepositoryIndexSetEntity[];
}

export class SetRepositoryIndexSetDto {
    public readonly name: string;
    public readonly exportVersion: string;
    public readonly description?: string;
    public readonly modes: ReviewMode[];
    public readonly cardCount: number;
    public readonly file: string;
    public readonly supported: boolean;
}
