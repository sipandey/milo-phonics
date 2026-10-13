import type { BlendingWord, PhonicsLevel } from './phonics';

export type CurriculumContentStatus = 'draft' | 'review' | 'published' | 'retired';
export type CurriculumWordShape = 'VC' | 'CVC' | 'DIGRAPH' | 'OTHER';

export interface CurriculumSoundSet extends PhonicsLevel {
  readonly status: CurriculumContentStatus;
  readonly prerequisiteLevelIds: readonly number[];
  readonly reviewRuleIds: readonly string[];
  readonly audioAssetIds: readonly string[];
}

export interface CurriculumPhoneme {
  readonly id: string;
  readonly grapheme: string;
  readonly phoneme: string;
  readonly audioAssetId: string;
  readonly introducedInLevelId: number;
  readonly status: CurriculumContentStatus;
}

export interface CurriculumGrapheme {
  readonly id: string;
  readonly text: string;
  readonly phonemeIds: readonly string[];
  readonly audioAssetId: string;
  readonly introducedInLevelId: number;
  readonly status: CurriculumContentStatus;
}

export interface CurriculumWord {
  readonly id: string;
  readonly text: string;
  readonly shape: CurriculumWordShape;
  readonly levelId: number;
  readonly graphemeIds: readonly string[];
  readonly phonemeIds: readonly string[];
  readonly audio: {
    readonly word?: string;
    readonly sentence?: string;
  };
  readonly status: CurriculumContentStatus;
  readonly source: BlendingWord;
}

export interface CurriculumDigraph {
  readonly id: string;
  readonly text: string;
  readonly phonemeIds: readonly string[];
  readonly introducedInLevelId: number | null;
  readonly audioAssetIds: readonly string[];
  readonly status: CurriculumContentStatus;
}

export interface CurriculumReaderPage {
  readonly id: string;
  readonly readerId: string;
  readonly order: number;
  readonly text: string;
  readonly wordIds: readonly string[];
  readonly audioAssetIds: readonly string[];
  readonly status: CurriculumContentStatus;
}

export interface CurriculumReviewRule {
  readonly id: string;
  readonly description: string;
  readonly maxItemsPerSession: number;
  readonly revisitAfterSessions: number;
  readonly status: CurriculumContentStatus;
}

export interface CurriculumScope {
  readonly summary: string;
  readonly included: readonly string[];
  readonly excludedClaims: readonly string[];
}

export interface CurriculumContentManifest {
  readonly schemaVersion: 1;
  readonly contentVersion: string;
  readonly status: CurriculumContentStatus;
  readonly scope: CurriculumScope;
  readonly soundSets: readonly CurriculumSoundSet[];
  readonly phonemes: readonly CurriculumPhoneme[];
  readonly graphemes: readonly CurriculumGrapheme[];
  readonly words: readonly CurriculumWord[];
  readonly digraphs: readonly CurriculumDigraph[];
  readonly readerPages: readonly CurriculumReaderPage[];
  readonly reviewRules: readonly CurriculumReviewRule[];
  readonly blendingWords: readonly BlendingWord[];
}
