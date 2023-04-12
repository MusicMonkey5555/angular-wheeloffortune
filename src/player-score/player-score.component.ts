import { NgClass, NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../player';

@Component({
  selector: 'app-player-score',
  standalone: true,
  templateUrl: './player-score.component.html',
  styleUrls: ['./player-score.component.css'],
  imports: [NgStyle,NgClass]
})
export class PlayerScoreComponent implements OnInit {
  @Input() player:Player;
  @Input() displayRound?:boolean = true;
  @Input() isPlayersTurn?:boolean = false;

  get Score():string {
    return this.player.Score.toLocaleString('en');
  }
  get TotalScore():string {
    return this.player.TotalScore.toLocaleString('en');
  }

  constructor() { }

  ngOnInit() {
  }

}