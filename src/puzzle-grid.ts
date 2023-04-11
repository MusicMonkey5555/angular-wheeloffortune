import { PuzzleLetter } from "./puzzle-letter";

export class PuzzleGrid {
  private _puzzle: PuzzleLetter[][];
  get Puzzle() { return this._puzzle; }

  public ShowAll(){
    this._puzzle.forEach((row) => row.forEach((letter) => letter.reveal(letter.peak())));
  }

  constructor(puzzleText:string, gridLength:number[]){
    //Clean the text
    puzzleText = puzzleText.trim().toUpperCase();

    //Clear out/init the puzzle
    this._puzzle = [];

    //Set the start of our rows
    let row: number = 0;

    //Check if we only take up the middle
    if (puzzleText.length <= gridLength.reduce((count, v, i, a) => i == 0 || i == a.length - 1 ? count + 0 : count + v, 0)) {
      this._puzzle[row] = Array.from(
        { length: gridLength[row] },
        (v, i) => new PuzzleLetter(' ')
      );
      row++;
    }

    //Get all the words of the puzzle so we can center them
    let words: string[] = puzzleText.split(/(\s+)/).filter(w => w.trim().length > 0);

    //Loop through each word adding it to the row and moveing to the next row based on what fits
    let lineText: PuzzleLetter[] = [];
    words.forEach((word, i) => {
      //Check if this word will fit on this line
      if (lineText.length + word.length <= gridLength[row]) {
        //If we added something to this line then add a space between words
        if (lineText.length > 0) {
          lineText.push(new PuzzleLetter(' '));
        }
      } else {
        //Pad to center text
        let extra: number = gridLength[row] - lineText.length;
        if (extra > 0) {
          for (let e = 0; e < extra; e++) {
            if (e % 2 == 0) {
              lineText.unshift(new PuzzleLetter(' '));
            } else {
              lineText.push(new PuzzleLetter(' '));
            }
          }
        }
        //Add the line to our puzzle and move to fill out next line
        this._puzzle.push(lineText);
        lineText = [];
        row++;
      }

      //Add each character from the word to our line grid
      let temp: PuzzleLetter[] = Array.from(
        word,
        (c, k) => new PuzzleLetter(c)
      );
      lineText = lineText.concat(temp);
    });

    //Pad to center text we had left
    let extra: number = gridLength[row] - lineText.length;
    if (extra > 0) {
      for (let i = 0; i < extra; i++) {
        if (i % 2 == 0) {
          lineText.unshift(new PuzzleLetter(' '));
        } else {
          lineText.push(new PuzzleLetter(' '));
        }
      }
    }

    //Add whatever we had left to our puzzle
    this._puzzle.push(lineText);
    row++;

    //add extra lines for board if we didn't fill it up
    for (let i = row; i < gridLength.length; i++) {
      this._puzzle.push(
        Array.from(
          { length: gridLength[i] },
          (v, n) => new PuzzleLetter(' ')
        )
      );
    }
  }
}