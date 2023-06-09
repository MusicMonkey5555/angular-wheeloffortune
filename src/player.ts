export class Player {
  private name: string = '';
  private color: string = '';
  private score: number = 0;
  private totalScore: number = 0;
  private hasMillionWedge:boolean = false;
  private roundScore: number[];
  get Name() { return this.name; }
  get Color() { return this.color; }
  get Score() { return this.score; }
  get TotalScore() { return this.totalScore; }
  get Rounds(): number[] { return this.roundScore.map(v => v); }
  get HasMillionWedge():boolean { return this.hasMillionWedge; }

  constructor(name: string, color:string){
    this.name = name;
    this.color = color;
    this.roundScore = [];
  }

  public updateTotal() {
    this.totalScore = this.roundScore.reduce(
      (total, roundScore) => total + roundScore,
      0
    );
  }

  public bankrumpt(){
    this.score = 0;
    this.hasMillionWedge = false;
  }

  public setHasMillionWedge(){
    this.hasMillionWedge = true;
  }

  public addScore(points: number): boolean {
    if(this.score + points >= 0){
      this.score += points;
      return true;
    } else {
      return false;
    }
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