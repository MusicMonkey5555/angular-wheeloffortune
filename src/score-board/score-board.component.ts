import { Component, Input, OnInit } from '@angular/core';
import { PlayerScoreComponent } from '../player-score/player-score.component';
import { Player } from '../player';
import { NgFor } from '@angular/common';
import { ScoreService } from '../score.service';

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.css'],
  standalone: true,
  imports:[PlayerScoreComponent, NgFor]
})
export class ScoreBoardComponent implements OnInit {
  @Input() players:Player[];
  @Input() displayRound?:boolean = true;
  constructor(private score:ScoreService) { }

  ngOnInit() {
  }

  get CurrentPlayerIndex(){
    return this.score.CurrentPlayerIndex;
  }

}