export type DungeonMasterContext = {
  turn: {
    number: number;
    prompt: string;
  };
  world: {
    description: string;
    attributes: unknown;
    characters: Array<{
      id: number;
      name: string;
      description: string;
      attributes: unknown;
      controlledByPlayerId: number | null;
    }>;
    locations: Array<{
      id: number;
      name: string;
      description: string;
      attributes: unknown;
    }>;
    things: Array<{
      id: number;
      name: string;
      description: string;
      attributes: unknown;
    }>;
  };
  players: Array<{
    id: number;
    displayName: string;
    characterIds: number[];
  }>;
  inputs: Array<{
    playerId: number;
    text: string;
  }>;
};

export type TurnResolution = {
  narrative: string;
};

export abstract class DungeonMaster {
  abstract resolveTurn(context: DungeonMasterContext): Promise<TurnResolution>;
}
