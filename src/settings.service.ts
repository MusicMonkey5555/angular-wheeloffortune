import { Injectable } from '@angular/core';
import { Settings } from './settings';

@Injectable()
export class SettingsService {
  private static settings:Settings = new Settings();

  constructor() {
   }

  get Settings(){
    return SettingsService.settings;
  }

  get TossUpCount():number {
    return SettingsService.settings.NumberOfRounds * (SettingsService.settings.TrippleTossUp ? 3 : 1);
  }
}