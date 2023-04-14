import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Settings } from '../settings';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [SettingsService],
  imports:[ReactiveFormsModule]
})
export class SettingsComponent implements OnInit {

  @Output() onSavedChanges = new EventEmitter<Settings>();

  constructor(private settings:SettingsService, private formBuilder:FormBuilder) { }

  saveSettingsForm = this.formBuilder.group({
    maxPlayers: this.settings.Settings.MaxPlayerCount,
    gameTime: (this.settings.Settings.TotalGameTimeSeconds / 60),
    solveTime: this.settings.Settings.SolveTimeSeconds,
    bonusTime: this.settings.Settings.BonusSolveTimeSeconds,
    betweenTime: this.settings.Settings.BetweenRoundTimeSeconds,
    trippleTossUp: this.settings.Settings.TrippleTossUp,
    virtualWheel: this.settings.Settings.UseVirtualWheel,
    roundCount: this.settings.Settings.NumberOfRounds,
    bonusPuzzleCount: this.settings.Settings.BonusPuzzleCount
  });

  ngOnInit() {
  }

  onSubmit(){
    let settings = this.settings.Settings;
    let controls = this.saveSettingsForm.controls;

    //Update our settings
    settings.MaxPlayerCount = controls.maxPlayers.value;
    settings.TotalGameTimeSeconds = controls.gameTime.value * 60;
    settings.SolveTimeSeconds = controls.solveTime.value;
    settings.BonusSolveTimeSeconds = controls.bonusTime.value;
    settings.BetweenRoundTimeSeconds = controls.betweenTime.value;
    settings.TrippleTossUp = controls.trippleTossUp.value;
    settings.UseVirtualWheel = controls.virtualWheel.value;
    settings.NumberOfRounds = controls.roundCount.value;
    settings.BonusPuzzleCount = controls.bonusPuzzleCount.value;

    console.log(this.settings.Settings);

    this.onSavedChanges.emit(this.settings.Settings);
  }

  onReset(){
    let settings = this.settings.Settings;
    let controls = this.saveSettingsForm.controls;
    this.saveSettingsForm.reset({
      maxPlayers: this.settings.Settings.MaxPlayerCount,
      gameTime: (this.settings.Settings.TotalGameTimeSeconds / 60),
      solveTime: this.settings.Settings.SolveTimeSeconds,
      bonusTime: this.settings.Settings.BonusSolveTimeSeconds,
      betweenTime: this.settings.Settings.BetweenRoundTimeSeconds,
      trippleTossUp: this.settings.Settings.TrippleTossUp,
      virtualWheel: this.settings.Settings.UseVirtualWheel,
      roundCount: this.settings.Settings.NumberOfRounds,
      bonusPuzzleCount: this.settings.Settings.BonusPuzzleCount
    });
  }
}