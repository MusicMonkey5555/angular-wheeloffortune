export class Timer {
  private timerId: number;
  private start: number;
  private remaining: number;
  private callback: Function;
  constructor(callback: Function, seconds: number) {
    this.callback = callback;
    this.remaining = seconds * 1000;
    this.resume();
  }
  public isPaused(): boolean {
    return !this.timerId;
  }
  public getStart(): Date {
    return new Date(this.start);
  }
  get RemainingTime(): number {
    return this.isPaused()
      ? this.remaining
      : this.remaining - (Date.now() - this.start);
  }
  public pause(): boolean {
    if (!this.timerId) {
      return false;
    }

    clearTimeout(this.timerId);
    this.timerId = null;
    this.remaining -= Date.now() - this.start;
    return true;
  }
  public resume(): boolean {
    if (this.timerId) {
      return false;
    }

    this.start = Date.now();
    this.timerId = setTimeout(this.callback, this.remaining);
  }
}