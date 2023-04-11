import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [SettingsService],
})
export class SettingsComponent implements OnInit {

  @ViewChild('TotalGameTime') TotalGameTime:ElementRef;

  constructor(private settings:SettingsService) { }
  get Setttings(){return this.settings.Settings; }

  ngOnInit() {
  }

  onSubmit(event: any){
    console.log(event);
  }

  onSave() {
    this.settings.Settings.TotalGameTimeSeconds = this.TotalGameTime.nativeElement.value * 60;
    console.log(this.settings.Settings.TotalGameTimeSeconds);
  }

}