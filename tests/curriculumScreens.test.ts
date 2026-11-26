import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { CurriculumMapScreen } from '../src/components/curriculum/CurriculumMapScreen';
import { SoundPageScreen } from '../src/components/curriculum/SoundPageScreen';
import { teachingProgressStore } from '../src/services/teachingProgressStore';
import {
  DEFAULT_CHILD_ID,
  createEmptyTeachingProgress,
  introduceItem,
  markItem,
  setFocus,
} from '../src/services/teachingProgress';

const now = new Date('2026-11-26T12:00:00Z');
const noop = () => undefined;

afterEach(() => {
  teachingProgressStore.update(() => createEmptyTeachingProgress());
});

describe('CurriculumMapScreen', () => {
  it('shows Phase 2 sound tiles, blending marks, and tricky words', () => {
    const markup = renderToStaticMarkup(createElement(CurriculumMapScreen, { onBack: noop, onOpenSound: noop, onOpenActivity: noop, onOpenReader: noop }));
    expect(markup).toContain('Open the sound s, not introduced');
    expect(markup).toContain('Open the sound ck, not introduced');
    expect(markup).toContain('How did blending in Set 1 go?');
    expect(markup).toContain('the tricky word into');
  });

  it('reflects marks and lists practice words for the focus sounds', () => {
    teachingProgressStore.update((doc) => {
      let next = introduceItem(doc, DEFAULT_CHILD_ID, 'gpc.s', now);
      next = introduceItem(next, DEFAULT_CHILD_ID, 'gpc.a', now);
      next = markItem(next, DEFAULT_CHILD_ID, 'gpc.t', 'with-help', now);
      return setFocus(next, DEFAULT_CHILD_ID, ['gpc.t'], now);
    });
    const markup = renderToStaticMarkup(createElement(CurriculumMapScreen, { onBack: noop, onOpenSound: noop, onOpenActivity: noop, onOpenReader: noop }));
    expect(markup).toContain('Open the sound t, with-help');
    expect(markup).toContain('at, sat');
    expect(markup).toContain('Fewer than three words fit');
  });
});

describe('SoundPageScreen', () => {
  it('shows the sound, its controls, and which words need more sounds', () => {
    teachingProgressStore.update((doc) => introduceItem(doc, DEFAULT_CHILD_ID, 'gpc.t', now));
    const markup = renderToStaticMarkup(createElement(SoundPageScreen, { gpcId: 'gpc.t', onBack: noop }));
    expect(markup).toContain('Hear the sound t');
    expect(markup).toContain('✓ Sound introduced');
    expect(markup).toContain('Practise this sound');
    expect(markup).toContain('Hear sat sound by sound');
    expect(markup).toContain('Needs: s, a');
  });

  it('shows notes for the adult and a back button for an unknown sound', () => {
    expect(renderToStaticMarkup(createElement(SoundPageScreen, { gpcId: 'gpc.f', onBack: noop }))).toContain('can also be taught as a tricky word');
    expect(renderToStaticMarkup(createElement(SoundPageScreen, { gpcId: 'gpc.nope', onBack: noop }))).toContain('Back');
  });
});
