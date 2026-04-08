import type { AudioTrack } from './AudioTrack';
import type { VideoTrack } from './VideoTrack';
import type { ImageTrack } from './ImageTrack';
import type { TextTrack } from './TextTrack';

export type Track = AudioTrack | ImageTrack | TextTrack | VideoTrack;

export interface TrackLineItf {
  type: Track['type'],
  controller_key: string,
  main?: boolean,
  list: Track[]
}