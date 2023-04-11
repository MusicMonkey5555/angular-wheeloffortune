export class PuzzleLetter {
  private letter: string = ' ';
  private visible: boolean = false;

  constructor(l: string) {
    this.letter = l.trim();
    if (this.letter.length == 0) {
      this.letter = ' ';
    } else if (this.letter.length != 1) {
      throw Error('Invalid lengt');
    }
    this.visible = false;
  }

  get Letter(): string {
    return this.visible ? this.letter : ' ';
  }
  public peak(): string {
    return this.letter;
  }
  get isVisible(): boolean {
    return this.visible;
  }
  public isLetter(l: string): boolean {
    if (l.trim().length > 1) {
      throw Error('Invalid length');
    }

    return this.letter.trim().toUpperCase() === l.trim().toUpperCase();
  }
  public reveal(l: string): boolean {
    if (this.isLetter(l)) {
      this.visible = true;

      return true;
    } else {
      return false;
    }
  }
}