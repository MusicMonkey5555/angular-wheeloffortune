import { Injectable } from '@angular/core';
import { Settings } from './settings';

@Injectable()
export class SettingsService {
  private settings:Settings;

  constructor() {
    this.settings = new Settings();
   }

  get Settings(){
    return this.settings;
  }

  get TossUpCount():number {
    return this.settings.NumberOfRounds * (this.settings.TrippleTossUp ? 3 : 1);
  }
}