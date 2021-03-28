export class SetRepositoryEntity {
    public readonly id: string;
    public readonly publicId: string;
    public readonly name: string;
    public readonly indexUrl: string;
    public readonly imageUrl?: string;

    static fromDto(dto: SetRepositoryDto): SetRepositoryEntity {
        return Object.assign(new SetRepositoryEntity(), {
            id: dto.id,
            publicId: dto.publicId,
            name: dto.name,
            indexUrl: dto.indexUrl,
            imageUrl: dto.imageUrl,
        });
    }
}

export class CreateSetRepositoryDto {
    public readonly indexUrl: string;
}

export class SetRepositoryDto extends CreateSetRepositoryDto {
    public readonly id: string;
    public readonly publicId: string;
    public readonly name: string;
    public readonly imageUrl?: string;
}
