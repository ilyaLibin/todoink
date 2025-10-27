export interface MantraIdea {
  id: number;
  shortSummary: string; // up to 10 words
  fullDescription: string; // longer detailed description
  transcription: string; // original voice transcription
  timestamp: number;
  expanded: boolean; // UI state for expansion
}

export const defaultIdeas: MantraIdea[] = [];
