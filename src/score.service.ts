import { Injectable } from '@angular/core';
import { Player } from './player';

@Injectable()
export class ScoreService {
  private players: Player[];
  private currentPlayer: number = 0;
  private readonly vowelCost: number = 250;

  constructor(){}

  public addPlayer(fullname: string): boolean {
    if (
      !this.players.some(
        (player) =>
          player.name.trim().toUpperCase() === fullname.trim().toUpperCase()
      )
    ) {
      let p = new Player();
      p.name = fullname;
      this.players.push(p);
      return true;
    } else {
      return false;
    }
  }

  private get(i?: number) {
    return this.players[
      (i ?? -1) < 0 || i >= this.players.length ? this.currentPlayer : i
    ];
  }

  public getName(i?: number): string {
    return this.get(i).name;
  }
  public getScore(i?: number): number {
    return this.get(i).score;
  }
  public getTotalScore(i?: number): number {
    return this.get(i).totalScore;
  }
  public getRounds(i?: number): number[] {
    return this.get(i).roundScore;
  }
  public count(): number {
    return this.players.length;
  }
  public roundWon() {
    this.players.forEach((p, index) => {
      p.roundOver(index == this.currentPlayer);
    });
  }

  public bankrupt() {
    this.players[this.currentPlayer].score = 0;
  }

  public getWinnerIndexes(): number[] {
    let maxScore: number = -1;
    let winnerIndexes: number[];
    this.players.forEach((p, i) => {
      if (p.totalScore > maxScore) {
        winnerIndexes = [];
        winnerIndexes.push(i);
      } else if (p.totalScore == maxScore) {
        winnerIndexes.push(i);
      }
    });

    return winnerIndexes;
  }

  public currentIndex() {
    return this.currentPlayer;
  }

  public nextPlayer() {
    this.currentPlayer++;
    if (this.currentPlayer >= this.players.length) {
      this.currentPlayer = 0;
    }
  }

  public addScore(points: number, letterCount: number) {
    this.get().score += points * letterCount;
  }
  public canBuyVowel(): boolean {
    return this.get().score >= this.vowelCost;
  }

  public buyVowel(letterCount: number): boolean {
    if (letterCount > 0 && this.canBuyVowel()) {
      this.get().score -= this.vowelCost;
      return true;
    } else {
      return false;
    }
  }
}