import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { fakeAsync } from '@angular/core/testing';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Wheel Of Fortune</h1>
    <table>
        <tr *ngFor="let row in puzzle">
          <td *ngFor="let l in row">
          {{l.get()}}
          </td>
        </tr>
    </table>
    <h1>Hello from {{name}}!</h1>
    <a target="_blank" href="https://angular.io/start">
      Learn more about Angular 
    </a>
  `,
})

export class PuzzleLetter {
  private letter: string = ' ';
  private visible: boolean = false;
  constructor(l: string) {
    this.set(l);
  }
  public set(l: string) {
    this.letter = l.trim();
    if (this.letter.length == 0) {
      this.letter = ' ';
    } else if (this.letter.length != 1) {
      throw Error('Invalid lengt');
    }
    this.visible = false;
  }
  public get(): string {
    return this.visible ? this.letter : ' ';
  }
  public peak(): string {
    return this.letter;
  }
  public isVisible(): boolean {
    return this.visible;
  }
  public isLetter(l: string): boolean {
    if (l.trim().length > 1) {
      throw Error('Invalid length');
    }

    return this.letter === l;
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
class Player {
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
class ScoreBoard {
  private players: Player[];
  private currentPlayer: number = 0;
  private readonly vowelCost: number = 250;

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

export enum GameMode {
  Setup,
  Regular,
  TossUp,
  Train,
  BonusRound,
}

class Puzzle {
  public Title: string;
  public Text: string;
}

class Timer {
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
  public getRemainingTime(): number {
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

export class App {
  name = 'WheelOfFortune';
  private readonly vowels: string[] = ['a', 'e', 'i', 'o', 'u'];
  private readonly bonusRoundLetters: string[] = ['r', 's', 't', 'l', 'n', 'e'];
  private readonly bonusPuzzleCount: number = 4;
  private puzzles: Puzzle[];
  private bonusPuzzle: Puzzle[];
  private bonusPuzzleIndex: number = -1;
  private puzzleIndex: number = 0;
  private puzzleCount: number = 3;

  private gameTimer: Timer;
  private gameTimeSeconds: number = 22 * 60;

  //Letter grid
  //12
  //14
  //14
  //12
  private puzzle: PuzzleLetter[][];
  private readonly gridLength: number[] = [12, 14, 14, 12];
  private score: ScoreBoard;
  private mode: GameMode = GameMode.Setup;
  private lettersGuessed: string[];
  private noMoreVowels:Boolean = false;

  public addPlayer(name: string): boolean {
    if (this.mode == GameMode.Setup) {
      return this.score.addPlayer(name);
    } else {
      return false;
    }
  }

  public addPuzzle(
    title: string,
    text: string,
    isBonus: boolean = false
  ): boolean {
    if (this.mode == GameMode.Setup) {
      if (isBonus) {
        if (
          !this.bonusPuzzle.some(
            (p) => p.Title.trim().toUpperCase() === title.trim().toUpperCase()
          ) &&
          this.bonusPuzzle.length < this.bonusPuzzleCount
        ) {
          this.bonusPuzzle.push({ Title: title, Text: text });
          return true;
        } else {
          return false;
        }
      } else {
        if (this.puzzles.length < this.puzzleCount) {
          this.puzzles.push({ Title: title, Text: text });
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  public startGame(): boolean {
    if (this.mode == GameMode.Setup) {
      this.mode = GameMode.Regular;
      this.gameTimer = new Timer(() => {
        this.mode = GameMode.Train;
      }, this.gameTimeSeconds);
      return true;
    } else {
      return false;
    }
  }
  public pauseGame(): boolean {
    if (this.gameTimer) {
      return this.gameTimer.pause();
    } else {
      return false;
    }
  }
  public resumeGame(): boolean {
    if (this.gameTimer) {
      return this.gameTimer.resume();
    } else {
      return false;
    }
  }
  protected nextTurn() {
    this.score.nextPlayer();
  }

  public bankrupt(): boolean {
    if (this.mode == GameMode.Regular) {
      this.score.bankrupt();
      this.nextTurn();
      return true;
    } else {
      return false;
    }
  }

  public guessPuzzle(guess: string): boolean {
    let isSolved: boolean = this.checkPuzzle(guess);
    if (isSolved) {
      this.score.roundWon();
      this.nextPuzzle();
      return true;
    } else {
      this.nextTurn();
      return false;
    }
  }

  private nextPuzzle(): boolean {
    if (this.puzzleIndex + 1 < this.puzzles.length) {
      this.puzzleIndex++;
      this.setPuzzle(this.puzzles[this.puzzleIndex].Text);
      this.noMoreVowels = false;
      this.lettersGuessed = [];
      return true;
    } else {
      return false;
    }
  }

  private checkPuzzle(guess: string): boolean {
    return (
      (this.mode == GameMode.BonusRound
        ? this.bonusPuzzle[this.bonusPuzzleIndex].Text
        : this.puzzles[this.puzzleIndex].Text
      )
        .trim()
        .toUpperCase() === guess.trim().toUpperCase()
    );
  }

  public guessLetter(letter: string, points: number): boolean {
    let wasGuessed = this.lettersGuessed.includes(letter);

    if (this.vowels.includes(letter)) {
      if (!wasGuessed && this.score.canBuyVowel()) {
        this.lettersGuessed.push(letter);
        this.noMoreVowels = this.vowels.every((vowel) => this.lettersGuessed.includes(vowel));
        let revealed = this.reveal(letter);
        return this.score.buyVowel(revealed);
      } else {
        return false;
      }
    } else {
      if (!wasGuessed) {
        this.lettersGuessed.push(letter);
        let revealed = this.reveal(letter);
        if (revealed > 0) {
          this.score.addScore(points, revealed);
          return true;
        } else {
          this.nextTurn();
          return false;
        }
      } else {
        this.nextTurn();
        return false;
      }
    }
  }

  //set the pizzel from string
  public setPuzzle(puzzleText: string) {
    puzzleText = puzzleText.trim();
    let row: number = 0;
    if (puzzleText.length <= 14) {
      this.puzzle[row] = Array.from(
        { length: 12 },
        (v, i) => new PuzzleLetter(' ')
      );
      row++;
      let words: string[] = puzzleText.split(' ');
      let lineText: PuzzleLetter[];
      words.forEach((word, i) => {
        if (lineText.length + word.length <= this.gridLength[row]) {
          if (lineText.length > 0) {
            lineText.push(new PuzzleLetter(' '));
          }
        } else {
          let extra: number = this.gridLength[row] - lineText.length;
          if (extra > 0) {
            for (let e = 0; e < extra; e++) {
              if (e % 2 == 0) {
                lineText.unshift(new PuzzleLetter(' '));
              } else {
                lineText.push(new PuzzleLetter(' '));
              }
            }
          }
          this.puzzle.push(lineText);
          lineText = [];
        }
        let temp: PuzzleLetter[] = Array.from(
          word,
          (c, k) => new PuzzleLetter(c)
        );
        lineText = lineText.concat(temp);
      });
      let extra: number = this.gridLength[row] - lineText.length;
      if (extra > 0) {
        for (let i = 0; i < extra; i++) {
          if (i % 2 == 0) {
            lineText.unshift(new PuzzleLetter(' '));
          } else {
            lineText.push(new PuzzleLetter(' '));
          }
        }
      }
      this.puzzle.push(lineText);
      //add extra lines for board
      for (let i = row; i < this.gridLength.length; i++) {
        this.puzzle.push(
          Array.from(
            { length: this.gridLength[i] },
            (v, n) => new PuzzleLetter(' ')
          )
        );
      }
    }
  }
  // Loop through each row and letter revealing and counting how many are revealed
  protected reveal(l: string): number {
    let count: number = 0;
    this.puzzle.forEach((row: PuzzleLetter[], i) => {
      row.forEach((letter: PuzzleLetter, n: number) => {
        count += letter.reveal(l) ? 1 : 0;
      });
    });
    return count;
  }
}

bootstrapApplication(App);
