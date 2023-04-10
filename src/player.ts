export class Player {
  public name: string = '';
  public score: number = 0;
  public totalScore: number = 0;
  public roundScore: number[];
  public updateTotal() {
    this.totalScore = this.roundScore.reduce(
      (total, roundScore) => total + roundScore,
      0
    );
  }
  public roundOver(won: boolean) {
    if (won) {
      this.totalScore += this.score;
      this.roundScore.push(this.score);
      this.score = 0;
    } else {
      this.roundScore.push(0);
      this.score = 0;
    }
  }
}