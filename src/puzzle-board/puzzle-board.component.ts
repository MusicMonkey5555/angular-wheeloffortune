import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { PuzzleLetter } from '../puzzle-letter';

@Component({
  selector: 'app-puzzle-board',
  standalone: true,
  imports: [NgFor,NgClass,NgIf],
  templateUrl: './puzzle-board.component.html',
  styleUrls: ['./puzzle-board.component.css']
})
export class PuzzleBoardComponent implements OnInit {
  private _letterGrid:PuzzleLetter[][] = [[]];
  private _puzzleTitle:string;
  private _maxCells:number = 0;
  get maxCells():number {return this._maxCells;}

  @Input('puzzle')
  get letterGrid():PuzzleLetter[][] { return this._letterGrid; };
  set letterGrid(puzzle: PuzzleLetter[][]){
    this._maxCells = [...puzzle].sort((a, b) => b.length-a.length)[0].length;
    this._letterGrid = puzzle;
  }
  @Input('title') 
  get puzzleTitle():string { return this._puzzleTitle; }
  set puzzleTitle(title:string) { 
    this._puzzleTitle = title.trim().toUpperCase();
  }
  @Input() noMoreVowels:boolean;

  constructor() { }

  ngOnInit() {
  }

}