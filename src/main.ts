import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { Puzzle } from './puzzle';
import { Timer } from './timer';
import { GameMode } from './game-mode.enum';
import { ScoreService } from './score.service';
import { SettingsService } from './settings.service';
import { PuzzleLetter } from './puzzle-letter';
import { PuzzleBoardComponent } from './puzzle-board/puzzle-board.component';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'wof-app',
  standalone: true,
  imports: [CommonModule, PuzzleBoardComponent, SettingsComponent],
  providers: [ScoreService, SettingsService],
  templateUrl: './main.html',
})

export class App {
  name = 'Wheel Of Fortune';
  private readonly vowels: string[] = ['a', 'e', 'i', 'o', 'u'];
  private readonly bonusRoundLetters: string[] = ['r', 's', 't', 'l', 'n', 'e'];
  private puzzles: Puzzle[] = [];
  private puzzleIndex: number = -1;
  private bonusPuzzle: Puzzle[] = [];
  private bonusPuzzleIndex: number = -1;
  private tossUpPuzzle:Puzzle[] = [];
  private tossUpPuzzelIndex:number = -1;

  ///Keep track of total game time
  private gameTimer: Timer;

  //Letter grid
  //12
  //14
  //14
  //12
  private puzzle: PuzzleLetter[][];
  get PuzzleGrid() { return this.puzzle; }
  private readonly gridLength: number[] = [12, 14, 14, 12];
  private mode: GameMode = GameMode.Setup;
  private lettersGuessed: string[];
  private noMoreVowels:boolean = false;
  get NoMoreVowels(): boolean { return this.noMoreVowels; }
  get PuzzleTitle():string { return this.mode == GameMode.Regular ? this.puzzles[this.puzzleIndex].Title : "Test"; }
  get Players() { return this.score.Players; }
  get Mode() { return this.mode; }

  constructor(private score: ScoreService, private settings: SettingsService){
    /*
    this.addPuzzle("90's", "Puzzle text");
    this.addPlayer("Nathan Bowhay");
    this.startGame();
    this.guessLetter('z', 100);
    */
  }

  private maxPuzzleLength():number {
    return this.gridLength.reduce((count, v) => count + v, 0);
  }

  private isPuzzelLengthOk(puzzle:string):boolean {
    let maxLength = this.maxPuzzleLength();
    return puzzle.length <= maxLength;
  }

  public addPlayer(name: string): boolean {
    if (this.mode == GameMode.Setup && this.Players.length < this.settings.Settings.MaxPlayerCount) {
      return this.score.addPlayer(name);
    } else {
      return false;
    }
  }

  public addBonusPuzzle(title: string, text:string):boolean{
    if (this.mode == GameMode.Setup) {
      if ( this.isPuzzelLengthOk(text) && 
        !this.bonusPuzzle.some(
          (p) => p.Title.trim().toUpperCase() === title.trim().toUpperCase()
        ) &&
        this.bonusPuzzle.length < this.settings.Settings.BonusPuzzelCount
      ) {
        this.bonusPuzzle.push({ Title: title, Text: text });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public addTossUpPuzzle(title: string, text: string): boolean {
    if (this.mode == GameMode.Setup) {
      if (this.isPuzzelLengthOk(text) && this.tossUpPuzzle.length < this.settings.TossUpCount) {
        this.tossUpPuzzle.push({ Title: title, Text: text });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public addPuzzle(title: string, text: string): boolean {
    if (this.mode == GameMode.Setup) {
      if (this.isPuzzelLengthOk(text) && this.puzzles.length < this.settings.Settings.NumberOfRounds) {
        this.puzzles.push({ Title: title, Text: text });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public startGame(): boolean {
    if (this.mode == GameMode.Setup) {
      this.mode = GameMode.Regular;
      this.nextPuzzle();
      this.gameTimer = new Timer(() => {
        this.mode = GameMode.Train;
      }, this.settings.Settings.TotalGameTimeSeconds);
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
    //Check for bad letter
    if(letter.trim().length > 1 || letter.length < 0){
      return false;
    }
    //Clean up since Wheel is case sensative
    letter = letter.trim().toUpperCase();

    //Check if the letter was guessed already
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

  //set the puzzle from string
  public setPuzzle(puzzleText: string) {
    //Clean the text
    puzzleText = puzzleText.trim().toUpperCase();

    //Clear out the puzzle
    this.puzzle = [];

    //Set the start of our rows
    let row: number = 0;

    //Check if we only take up the middle
    if (puzzleText.length <= this.gridLength.reduce((count, v, i, a) => i == 0 || i == a.length - 1 ? count + 0 : count + v, 0)) {
      this.puzzle[row] = Array.from(
        { length: this.gridLength[row] },
        (v, i) => new PuzzleLetter(' ')
      );
      row++;
    }

    //Get all the words of the puzzle so we can center them
    let words: string[] = puzzleText.split(/(\s+)/).filter(w => w.trim().length > 0);

    //Loop through each word adding it to the row and moveing to the next row based on what fits
    let lineText: PuzzleLetter[] = [];
    words.forEach((word, i) => {
      //Check if this word will fit on this line
      if (lineText.length + word.length <= this.gridLength[row]) {
        //If we added something to this line then add a space between words
        if (lineText.length > 0) {
          lineText.push(new PuzzleLetter(' '));
        }
      } else {
        //Pad to center text
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
        //Add the line to our puzzle and move to fill out next line
        this.puzzle.push(lineText);
        lineText = [];
        row++;
      }

      //Add each character from the word to our line grid
      let temp: PuzzleLetter[] = Array.from(
        word,
        (c, k) => new PuzzleLetter(c)
      );
      lineText = lineText.concat(temp);
    });

    //Pad to center text we had left
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

    //Add whatever we had left to our puzzle
    this.puzzle.push(lineText);
    row++;

    //add extra lines for board if we didn't fill it up
    for (let i = row; i < this.gridLength.length; i++) {
      this.puzzle.push(
        Array.from(
          { length: this.gridLength[i] },
          (v, n) => new PuzzleLetter(' ')
        )
      );
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
