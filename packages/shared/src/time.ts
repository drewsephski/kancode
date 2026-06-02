export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export const epochClock: Clock = {
  now: () => new Date(0),
};
