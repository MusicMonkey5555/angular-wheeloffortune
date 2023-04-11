import { Injectable } from '@angular/core';
import { Player } from './player';

@Injectable()
export class ScoreService {
  private players: Player[] = [];
  private currentPlayerIndex: number = 0;
  private readonly vowelCost: number = 250;

  constructor(){}

  public addPlayer(fullname: string): boolean {
    if (
      !this.players.some(
        (player) =>
          player.Name.trim().toUpperCase() === fullname.trim().toUpperCase()
      )
    ) {
      let p = new Player(fullname);
      this.players.push(p);
      return true;
    } else {
      return false;
    }
  }

  public removePlayer(i:number):boolean{
    return this.players.splice(i,1).length > 0;
  }

  get Players():Player[] { return this.players; }
  get CurrentPlayer():Player { return this.players[this.currentPlayerIndex]; }
  get CurrentPlayerIndex():number { return this.currentPlayerIndex; }

  public roundWon() {
    this.players.forEach((p, index) => {
      p.roundOver(index == this.currentPlayerIndex);
    });
  }

  public bankrupt() {
    this.players[this.currentPlayerIndex].bankrumpt();
  }

  public getWinnerIndexes(): number[] {
    let maxScore: number = -1;
    let winnerIndexes: number[];
    this.players.forEach((p, i) => {
      if (p.TotalScore > maxScore) {
        winnerIndexes = [];
        winnerIndexes.push(i);
      } else if (p.TotalScore == maxScore) {
        winnerIndexes.push(i);
      }
    });

    return winnerIndexes;
  }

  public nextPlayer() {
    this.currentPlayerIndex++;
    if (this.currentPlayerIndex >= this.players.length) {
      this.currentPlayerIndex = 0;
    }
  }

  public addScore(points: number, letterCount: number) {
    this.CurrentPlayer.addScore(points * letterCount);
  }
  public canBuyVowel(): boolean {
    return this.CurrentPlayer.Score >= this.vowelCost;
  }

  public buyVowel(letterCount: number): boolean {
    if (letterCount > 0 && this.canBuyVowel()) {
      this.CurrentPlayer.addScore(-this.vowelCost);
      return true;
    } else {
      return false;
    }
  }
}