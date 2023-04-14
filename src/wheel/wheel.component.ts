import { NgClass, NgFor, NgStyle } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WheelWedge } from '../wheel-wedge';

const defaultWedges:WheelWedge[] = [
  {color: 'orange', value: '650'},
  {color: 'purple', value: '500'},
  {color: 'gold', value: '700'},
  {color: 'pink', value: '500'},
  {color: 'Tomato', value: '600'},
  {color: 'skyblue', value: '550'},
  {color: 'green', value: 'ONE MILLION $ DOLLARS'},
  {color: 'pink', value: '600'},
  {color: 'black', value: 'BANKRUPT'},
  {color: 'purple', value: '650'},
  {color: 'orange', value: '950'},
  {color: 'green', value: 'ONE MILLION $ DOLLARS'},
  {color: 'white', value: 'LOOSE A TURN'},
  {color: 'Tomato', value: '800'},
  {color: 'purple', value: '500'},
  {color: 'pink', value: '650'},
  {color: 'green', value: 'ONE MILLION $ DOLLARS'},
  {color: 'orange', value: '900'},
  {color: 'black', value: 'BANKRUPT'},
  {color: 'teal', value: '2500'},
  {color: 'PaleGreen', value: '500'},
  {color: 'gold', value: '900'},
  {color: 'Tomato', value: '700'},
  {color: 'green', value: 'ONE MILLION $ DOLLARS'},
]; 

@Component({
  selector: 'app-wheel',
  templateUrl: './wheel.component.html',
  styleUrls: ['./wheel.component.css'],
  standalone: true,
  imports:[NgStyle, NgFor, NgClass]
})

export class WheelComponent implements OnInit {
  
  private wedges:WheelWedge[] = [...defaultWedges];
  rotationDeg:number = 0;
  moveArrow:boolean = false;

  get Wedges() { return this.wedges; }

  @Output() onWheelStopped = new EventEmitter<WheelWedge>();

  constructor() {
    console.log(this.wedges.length)
  }

  ngOnInit() {
  }

  public isNumber(value:string){
    return !Number.isNaN(Number(value));
  }

  public displayWedgeValue(wedge:WheelWedge):string{
    if(Number.isNaN(Number(wedge.value))){
      return wedge.value;
    } else {
      return "$"+wedge.value;
    }
  }

  public rotateFunction(){
    var min = 90;
    var max = 1000;
    this.rotationDeg = Math.floor(Math.random() * (max - min) + min);

    //animate arrow
    this.moveArrow = true;
    setTimeout(() => {
      this.moveArrow = false;
      this.onWheelStopped.emit(this.wedges[0]);
    }, 5000);
  }

}