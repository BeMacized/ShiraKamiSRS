export class SrsLevel {
  id: number;
  levelDuration: number;
}

export class SrsSettings {
  levels: SrsLevel[];

  public static readonly defaults: SrsSettings = {
    levels: [
      // Apprentice 1
      { id: 0, levelDuration: 60 * 60 * 4 },
      // Apprentice 2
      { id: 1, levelDuration: 60 * 60 * 8 },
      // Apprentice 3
      { id: 2, levelDuration: 60 * 60 * 24 },
      // Apprentice 4
      { id: 3, levelDuration: 60 * 60 * 24 * 2 },
      // Guru 1
      { id: 4, levelDuration: 60 * 60 * 24 * 7 },
      // Guru 2
      { id: 5, levelDuration: 60 * 60 * 24 * 7 * 2 },
      // Master
      { id: 6, levelDuration: 60 * 60 * 24 * 7 * 4 },
      // Enlightened
      { id: 7, levelDuration: 60 * 60 * 24 * 7 * 4 * 4 },
      // Burned
      { id: 8, levelDuration: -1 },
    ],
  };
}
