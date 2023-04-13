export class CountDownTimer {
  private timerId: number;
  private start: number;
  private remaining: number;
  private totalTime: number;
  private callback: Function;
  private tickCallback: Function;
  constructor(callback: Function, tickCallback: Function, seconds: number) {
    this.callback = callback;
    this.tickCallback = tickCallback;
    this.remaining = seconds * 1000;
    this.totalTime = this.remaining;
    this.resume();
  }
  get isPaused(): boolean {
    return !this.timerId;
  }
  public getStart(): Date {
    return new Date(this.start);
  }
  get RemainingTime(): number {
    return this.isPaused
      ? this.remaining / 1000
      : (this.remaining - (Date.now() - this.start)) / 1000;
  }
  get TotalTime(): number {
    return this.totalTime / 1000;
  }
  public pause(): boolean {
    if (!this.timerId) {
      return false;
    }

    clearInterval(this.timerId);
    this.timerId = null;
    this.remaining -= Date.now() - this.start;
    return true;
  }
  public resume(): boolean {
    if (this.timerId) {
      return false;
    }

    this.start = Date.now();
    this.timerId = setInterval(() => {
      this.tickCallback();
      let timeLeft = this.remaining - (Date.now() - this.start);
      if(timeLeft <= 0) {
        clearInterval(this.timerId);
        this.callback();
      }
    }, 1000);
  }
}