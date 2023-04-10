import { Injectable } from '@angular/core';
import { Settings } from './settings';

@Injectable()
export class SettingsService {
  private settings:Settings;

  constructor() { }

  getSettings(){
    return this.settings;
  }

  getTossUpCount():number {
    return this.settings.NumberOfRounds * (this.settings.TrippleTossUp ? 3 : 1);
  }
}