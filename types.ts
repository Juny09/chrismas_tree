export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface WishResult {
  recipient: string;
  message: string;
}

export interface OrnamentProps {
  position: [number, number, number];
  color: string;
  scale?: number;
}