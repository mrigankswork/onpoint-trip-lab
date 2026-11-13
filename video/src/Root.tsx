import React from 'react';
import { Composition } from 'remotion';
import { DURATION, FPS } from './constants';
import { Film, type FilmProps } from './Film';

// music / voiceover switch on public/music.mp3 and public/voiceover.mp3. `npm run render` sets them if the files exist.
const defaults: FilmProps = { music: false, voiceover: false, sfx: true };

export const Root: React.FC = () => (
  <>
    <Composition id="OnpointDemo" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={DURATION} defaultProps={defaults} />
    <Composition id="OnpointDemoVertical" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={DURATION} defaultProps={defaults} />
  </>
);
