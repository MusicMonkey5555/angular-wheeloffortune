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
import { GamePuzzles } from './game-puzzles';
import { SetPuzzlesComponent } from './set-puzzles/set-puzzles.component';
import { PuzzleGrid } from './puzzle-grid';
import { Settings } from './settings';
import { ScoreBoardComponent } from './score-board/score-board.component';
import { GameActions } from './game-actions.enum';
import { CountDownTimer } from './count-down-timer';

@Component({
  selector: 'wof-app',
  standalone: true,
  imports: [CommonModule, PuzzleBoardComponent, SettingsComponent, SetPuzzlesComponent,ScoreBoardComponent],
  providers: [ScoreService, SettingsService],
  templateUrl: './main.html',
})

export class App {
  name = 'Wheel Of Fortune';
  private readonly vowels: string[] = ['A', 'E', 'I', 'O', 'U'];
  private readonly bonusRoundLetters: string[] = ['R', 'S', 'T', 'L', 'N', 'E'];
  private puzzles: GamePuzzles = new GamePuzzles();
  get GamePuzzles(){ return this.puzzles; }
  private puzzleIndex: number = -1;
  private bonusPuzzleIndex: number = -1;
  private tossUpPuzzleIndex:number = -1;

  ///Keep track of total game time
  private gameTimer: Timer;
  private roundTimer: CountDownTimer;
  public roundSecondsLeft:number;
  get FormatedRoundSeconds():string { 
    return `${Math.round(this.roundSecondsLeft/60).toString().padStart(2,'0')}:${(this.roundSecondsLeft % 60).toString().padStart(2,'0')}`; 
  }
  get RoundTimer() { return this.roundTimer;}

  //Letter grid
  //12
  //14
  //14
  //12
  private puzzleGrid: PuzzleGrid;
  get PuzzleGrid() { return this.puzzleGrid; }
  private readonly gridLength: number[] = [12, 14, 14, 12];
  get GridLength():number[] { return this.gridLength; }
  private mode: GameMode = GameMode.Setup;
  private action: GameActions = GameActions.None;
  get Action() { return this.action; }
  get GameActions() { return GameActions; }
  get GameModes() {return GameMode; }
  private lettersGuessed: string[];
  private noMoreVowels:boolean = false;
  get NoMoreVowels(): boolean { return this.noMoreVowels; }
  get PuzzleTitle():string { return this.getCurrentPuzzle().Title; }
  get Players() { return this.score.Players; }
  get CanBuyVowel() { return this.score.canBuyVowel(); }
  get Settings() {return this.settings.Settings; }
  get Mode() { return this.mode; }
  editSetting:string = "settings";
  private puzzleGuess:string = "";
  private spinPoints:number = 0;
  private revealedCount:number = 0;
  displayRoundScores:boolean = true;
  get LetterCount(){ return this.revealedCount; }
  get SpinPoints() { return this.spinPoints; }

  constructor(private score: ScoreService, private settings: SettingsService){
    this.addPuzzle("90's", "Boom Box");
    this.addPuzzle("Video Games", "Mine Craft");
    this.addPuzzle("People", "Nathan");

    this.addTossUpPuzzle("90's", "Boom Box");
    this.addTossUpPuzzle("Video Games", "Mine Craft");
    this.addTossUpPuzzle("People", "Nathan");

    this.addBonusPuzzle("90's", "Boom Box");
    this.addBonusPuzzle("People", "Monroe");
    this.addBonusPuzzle("Thing", "Table & Chairs");
    //this.addBonusPuzzle("People", "Nathan");

    this.addPlayer("Nathan Bowhay");
    this.addPlayer("Monroe");
    this.addPlayer("Kelsey");
    /*
    this.startGame();
    this.onEnterPoints('200');
    this.onLetterGuess('b');
    this.onVowelGuess('o');
    */
  }

  public onEnterPoints(points:string){
    this.spinPoints = Number(points);
  }

  public onLetterGuess(letter:string){
    letter = letter.trim().toUpperCase();
    if(/[A-Z]{1}/.test(letter) && !this.vowels.includes(letter)){
      this.guessLetter(letter.trim().toUpperCase(), this.spinPoints);
    }
  }

  public onVowelGuess(letter:string){
    letter = letter.trim().toUpperCase();
    if(this.vowels.includes(letter)){
      if(this.guessLetter(letter.trim().toUpperCase(), this.spinPoints)){
        this.action = GameActions.None;
      }
    }
  }

  public onPuzzleGuessLetter(text:string){
    this.puzzleGuess = text;
  }

  public onPuzzleGuess(){
    this.guessPuzzle(this.puzzleGuess);
  }

  public onBankrupt(){
    this.bankrupt();
  }

  public chooseSpin(){
    this.action = GameActions.Spin;
  }

  public chooseBuyVowel(){
    this.action = GameActions.BuyVowel;
  }

  public chooseGuessLetter() {
    this.action = GameActions.GuessLetter;
  }

  public chooseGuessPuzzle(){
    this.startGuessCountdown();
  }

  public chooseSkip(){
    this.nextTurn();
  }

  private getCurrentPuzzle():Puzzle{
    let puzzle:Puzzle = null;
    switch(this.mode){
      case GameMode.Regular:
      case GameMode.Train:
        puzzle = this.puzzles.normal[this.puzzleIndex];
        break;
      case GameMode.TossUp:
        puzzle = this.puzzles.tossUp[this.tossUpPuzzleIndex];
        break;
      case GameMode.BonusRound:
        puzzle = this.puzzles.bonus[this.bonusPuzzleIndex];
        break;
    }
    return puzzle;
  }

  public onSettingsSaved(event:Settings){
  }

  public onPuzzlesSaved(event:GamePuzzles){
    this.puzzles = event;
  }

  public maxPuzzleLength():number {
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

  public removePlayer(i: number): boolean {
    if (this.mode == GameMode.Setup && this.Players.length > 0) {
      return this.score.removePlayer(i);
    } else {
      return false;
    }
  }

  public addBonusPuzzle(title: string, text:string):boolean{
    if (this.mode == GameMode.Setup) {
      if ( this.isPuzzelLengthOk(text) && 
        !this.puzzles.bonus.some(
          (p) => p.Title.trim().toUpperCase() === title.trim().toUpperCase()
        ) &&
        this.puzzles.bonus.length < this.settings.Settings.BonusPuzzleCount
      ) {
        this.puzzles.bonus.push({ Title: title, Text: text });
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
      if (this.isPuzzelLengthOk(text) && this.puzzles.tossUp.length < this.settings.TossUpCount) {
        this.puzzles.tossUp.push({ Title: title, Text: text });
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
      if (this.isPuzzelLengthOk(text) && this.puzzles.normal.length < this.settings.Settings.NumberOfRounds) {
        this.puzzles.normal.push({ Title: title, Text: text });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public canStartGame():boolean{
    if(this.Players.length <= 1 || 
      this.Players.length > this.settings.Settings.MaxPlayerCount ||
      [...new Set(this.Players.map(p => p.Name.trim().toUpperCase()))].length != this.Players.length){
      return false;
    }
    if(this.puzzles.normal.length != this.settings.Settings.NumberOfRounds || 
      this.puzzles.normal.some((p) => p.Text.trim() == "" || p.Title.trim() == "")){
      return false;
    }
    if(this.puzzles.tossUp.length != this.settings.TossUpCount ||
      this.puzzles.tossUp.some((p) => p.Text.trim() == "" || p.Title.trim() == "")){
      return false;
    }
    let uniqueTitles = [...new Set(this.puzzles.bonus.map(p => p.Title.trim().toUpperCase()))];
    if(this.puzzles.bonus.length != this.settings.Settings.BonusPuzzleCount ||
      this.puzzles.bonus.some((p) => p.Text.trim() == "" || p.Title.trim() == "") ||
      uniqueTitles.length != this.settings.Settings.BonusPuzzleCount){
      return false;
    }

    return true;;
  }

  public startGame(): boolean {
    if (this.mode == GameMode.Setup && this.canStartGame()) {
      this.mode = GameMode.Regular;
      this.action = GameActions.None;
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
    this.action = GameActions.None;
    this.revealedCount = 0;
    this.spinPoints = 0;
    this.roundSecondsLeft = 0;
    this.puzzleGuess = "";
    this.roundTimer = null;
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
      this.roundTimer = null;
      this.displayRoundScores = false;
      this.action = GameActions.Solved;
      this.puzzleGrid.ShowAll();
      setTimeout(() => {
        this.displayRoundScores = true;
        this.nextPuzzle();
      }, 1000 * this.Settings.BetweenRoundTimeSeconds);
      return true;
    } else {
      this.nextTurn();
      return false;
    }
  }

  private nextPuzzle(): boolean {
    if (this.puzzleIndex + 1 < this.puzzles.normal.length) {
      this.puzzleIndex++;
      this.setPuzzle(this.puzzles.normal[this.puzzleIndex].Text);
      this.action = GameActions.None;
      this.puzzleGuess = "";
      this.spinPoints = 0;
      this.revealedCount = 0;
      this.noMoreVowels = false;
      this.lettersGuessed = [];
      this.roundTimer = null;
      return true;
    } else {
      return false;
    }
  }

  private checkPuzzle(guess: string): boolean {
    let currentPuzzle = this.getCurrentPuzzle();

    return currentPuzzle.Text.trim().toUpperCase() === guess.trim().toUpperCase();
  }

  private startGuessCountdown() {
    this.action = GameActions.GuessPuzzle;
    if(this.settings.Settings.SolveTimeSeconds > 0){
      this.roundSecondsLeft = this.settings.Settings.SolveTimeSeconds;
      this.roundTimer = new CountDownTimer(() => {
        this.nextTurn();
        this.roundTimer = null;
      }, () => {
        this.roundSecondsLeft = Math.round(this.roundTimer.RemainingTime);
      }, this.settings.Settings.SolveTimeSeconds);
    }
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
        this.noMoreVowels = this.vowels.filter((v) => this.getCurrentPuzzle().Text.includes(v)).every((vowel) => this.lettersGuessed.includes(vowel));
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
          this.revealedCount = revealed;
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
    this.puzzleGrid = new PuzzleGrid(puzzleText, this.gridLength);
  }
  // Loop through each row and letter revealing and counting how many are revealed
  protected reveal(l: string): number {
    let count: number = 0;
    this.puzzleGrid.Puzzle.forEach((row: PuzzleLetter[], i) => {
      row.forEach((letter: PuzzleLetter, n: number) => {
        count += letter.reveal(l) ? 1 : 0;
      });
    });
    return count;
  }
}

bootstrapApplication(App);
