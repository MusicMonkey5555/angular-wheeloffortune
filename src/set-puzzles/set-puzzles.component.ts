import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PuzzleGrid } from '../puzzle-grid';
import { PuzzleLetter } from '../puzzle-letter';
import { GamePuzzles } from '../game-puzzles';
import { SettingsService } from '../settings.service';
import { PuzzleBoardComponent } from '../puzzle-board/puzzle-board.component';
import { Puzzle } from '../puzzle';

@Component({
  selector: 'app-set-puzzles',
  standalone: true,
  templateUrl: './set-puzzles.component.html',
  styleUrls: ['./set-puzzles.component.css'],
  providers: [SettingsService],
  imports: [NgFor,PuzzleBoardComponent]
})
export class SetPuzzlesComponent implements OnInit {
  private _puzzles: GamePuzzles;
  private puzzleGrid:PuzzleGrid;

  @Input()
  get puzzles():GamePuzzles { return this._puzzles; };
  set puzzles(puzzles: GamePuzzles){
    //Check how many we should have and fill out blanks
    for(let i = puzzles.normal.length; i < this.settings.Settings.NumberOfRounds; i++){
      puzzles.normal.push({Text: "", Title:""});
    }

    for(let i = puzzles.tossUp.length; i < this.settings.TossUpCount; i++){
      puzzles.tossUp.push({Text: "", Title:""});
    }

    for(let i = puzzles.bonus.length; i < this.settings.Settings.BonusPuzzleCount; i++){
      puzzles.bonus.push({Text: "", Title:""});
    }

    this.currentPuzzleIndex = 0;
    this.puzzleType = "normal";
    this._puzzles = puzzles;
  }
  @Input() maxPuzzleLength: number;
  @Input() gridLength: number[];

  get PuzzleGrid():PuzzleLetter[][] { return this.puzzleGrid ? this.puzzleGrid.Puzzle : null; }

  get CurrentPuzzle():Puzzle{
    return this._puzzles[this.puzzleType][this.currentPuzzleIndex];
  }

  public updateGrid(){
    this.puzzleGrid = new PuzzleGrid(this.CurrentPuzzle.Text, this.gridLength);
    this.puzzleGrid.ShowAll();
  }

  private currentPuzzleIndex:number = 0;
  public updateCurrentPuzzle(index:number){
    if(index < this._puzzles[this.puzzleType].length){
      this.currentPuzzleIndex = index;

      //Clear grid
      this.puzzleGrid = null;
      this.updateGrid();
    }
  }

  private puzzleType:string = "normal";
  get PuzzleType():string { return this.puzzleType; }
  set PuzzleType(puzzleType:string){
    if(puzzleType != this.puzzleType){
      this.currentPuzzleIndex = 0;
      this.puzzleType = puzzleType;

      //Clear grid
      this.puzzleGrid = null;
      this.updateGrid();
    }
  }

  constructor(private settings: SettingsService) {}

  ngOnInit() {}

  public onTitleKey(title: string){
    this.CurrentPuzzle.Title = title;
  }
  public onTextKey(text: string){
    this.CurrentPuzzle.Text = text;
    this.updateGrid();
  }
}
