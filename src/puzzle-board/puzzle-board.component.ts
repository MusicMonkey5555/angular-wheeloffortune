import { Component, OnInit, Input } from '@angular/core';
import { PuzzleLetter } from '../puzzle-letter';

@Component({
  selector: 'app-puzzle-board',
  standalone: true,
  templateUrl: './puzzle-board.component.html',
  styleUrls: ['./puzzle-board.component.css']
})
export class PuzzleBoardComponent implements OnInit {
  @Input('puzzle') letterGrid:PuzzleLetter[][];
  @Input('title') puzzleTitle:string;

  constructor() { }

  ngOnInit() {
  }

}