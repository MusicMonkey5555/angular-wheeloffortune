import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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

  @Output() onSavedChanges = new EventEmitter<boolean>();

  constructor(private settings:SettingsService, private formBuilder:FormBuilder) { }

  saveSettingsForm = this.formBuilder.group({
    maxPlayers: this.settings.Settings.MaxPlayerCount,
    gameTime: (this.settings.Settings.TotalGameTimeSeconds / 60),
    bonusTime: this.settings.Settings.BonusSolveTimeSeconds,
    trippleTossUp: this.settings.Settings.TrippleTossUp,
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
    settings.BonusSolveTimeSeconds = controls.bonusTime.value;
    settings.TrippleTossUp = controls.trippleTossUp.value;
    settings.NumberOfRounds = controls.roundCount.value;
    settings.BonusPuzzleCount = controls.bonusPuzzleCount.value;

    this.onSavedChanges.emit(true);
  }

  onReset(){
    let settings = this.settings.Settings;
    let controls = this.saveSettingsForm.controls;
    this.saveSettingsForm.reset({
      maxPlayers: this.settings.Settings.MaxPlayerCount,
      gameTime: (this.settings.Settings.TotalGameTimeSeconds / 60),
      bonusTime: this.settings.Settings.BonusSolveTimeSeconds,
      trippleTossUp: this.settings.Settings.TrippleTossUp,
      roundCount: this.settings.Settings.NumberOfRounds,
      bonusPuzzleCount: this.settings.Settings.BonusPuzzleCount
    });
  }
}