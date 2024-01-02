"use strict";
const MINE_IMG = "💣";
const EMPTY_IMG = " ";
const EMPTY = "EMPTY";
const MINE = "MINE";
const FLAG_IMG = "🚩";
// var MOOD = '😄'
// const HAPPY ='😄'
// const SAD ='😲'
// const HURT ='🤕'
// const DEAD ='💀'
const WINNER = "😎";
const gFlow = ["💀", "🤕", "😲", "😄"];
const HINT = "💡";

var gBoard;
var gLevel = {
  SIZE: 4,
  MINES: 2,
};
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};
var gLivesLeft = 3;
var gHintLeft = 3;
var gIsHint = false;
var gFirstClick = true;
var gMarked
var gLastUser=''

//This is called when page loads
function onInit() {
  gBoard = buildBoard();
  // addMines(gLevel.MINES)
  renderBoard(gBoard, ".board-container");
  updateLives();
  htmlHintsCounter();
  // updateLastUser()
}

//Builds the board
// Set the mines
// Call setMinesNegsCount()
// Return the created board
function buildBoard() {
  const board = createMat(10, 10);
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      board[i][j] = {
        minesAroundCount: 4,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  return board;
}

//Render the board as a <table>
// to the page
function renderBoard(mat) {
  var strHTML = "<table><tbody>";
  for (var i = 0; i < mat.length; i++) {
    strHTML += "<tr>";
    for (var j = 0; j < mat[0].length; j++) {
      const className = `cell cell-${i}-${j}`;
      const elCell = document.querySelector(`.cell-${i}-${j}`)

      strHTML += `<td oncontextmenu="onCellMarked(${elCell},${i},${j})" onclick="onCellClicked(${i},${j})" class="${className}">`;
      // strHTML += `<td oncontextmenu="onCellMarked(${elCell},${i},${j})" onclick=" header(${location}), onCellClicked(${cell},${i},${j})" class="${className}">`;

      mat[0][0].isMine = true;
      mat[2][2].isMine = true;
      mat[7][7].isMine = true;
      // mat[i][j].isShown = true;

      // if (mat[i][j].isMine) {
      //   strHTML += MINE_IMG;
      // } else {
      //   strHTML += EMPTY_IMG;
      // }
      mat[i][j].minesAroundCount = checkMinesAroundCount(i, j);
      if (mat[i][j].isShown) {
        strHTML += `${mat[i][j].minesAroundCount}`;
      } else {
        strHTML += EMPTY_IMG;
      }

      strHTML += "</td>\n";
    }
    strHTML += "</tr>";
  }
  strHTML += "</tbody></table>";

  const elContainer = document.querySelector(".board-container");
  elContainer.innerHTML = strHTML;
  updateBoardMinesCount(mat);
}
function updateBoardMinesCount(mat) {
  const elMines = document.querySelector(".negmine");
  elMines.innerHTML = setMinesNegsCount(mat);
  gMarked =setMinesNegsCount(mat)
}
//Count mines around each cell
// and set the cell's
// minesAroundCount.
function setMinesNegsCount(board) {
  var minesAmount = 0;
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (board[i][j].isMine) minesAmount++;
    }
  }
  return minesAmount;
}

function checkMinesAroundCount(rowIdx, colIdx) {
  var minesCounter = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      if (i === rowIdx && j === colIdx) continue;
      if (gBoard[i][j].isMine) minesCounter++;
    }
  }
  return minesCounter;
}

function onCellClicked(i, j) {
  // if(gFirstClick){
  //   if(gBoard[i][j].isMine){
  //     gBoard[i][j].isMine=false
  //     addMine()
  //     gFirstClick=false
  //   }
  // }
  if (gBoard[i][j].isShown) return;
  if (gBoard[i][j].isMarked) return;
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  if (gIsHint) {
    revealNeg(elCell, i, j);
    gHintLeft--;
    htmlHintsCounter();
    hintOff();
  }
  expandShown(gBoard, elCell, i, j);

  revealCell(elCell, i, j);
  // checkGameOver()
  // console.log(gBoard[i][j]);
}
function revealNeg(newCell, rowIdx, colIdx) {
  console.log("hi");
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      if (gBoard[i][j].isShown) continue;
      var newCell=document.querySelector(`cell-${i}-${j}`);
      revealCell(newCell, i, j);
      setTimeout(() => unrevealCell(newCell, i, j), 1000);
    }
  }
}
function revealCell(cell, i, j) {
  gBoard[i][j].isShown = true;

  if (!gBoard[i][j].isMine) {
    cell.innerHTML = checkMinesAroundCount(i, j); 
    //////////
    if(checkMinesAroundCount(i, j)===0){
      cell.innerHTML = EMPTY_IMG 
      console.log('hihihihihi');
  }
}else {
    cell.innerHTML = MINE_IMG;
    if (!gIsHint) {
      gLivesLeft--;
      updateLives();
    }
  }
  if (gIsHint) {
    setTimeout(() => unrevealCell(cell, i, j), 1000);
  }
  // expandShown(gBoard, cell, i, j);
}

function unrevealCell(cell, i, j) {
  gBoard[i][j].isShown = false;
  cell.innerHTML = EMPTY_IMG;
}

function addMines(amount) {
  for (var i = 1; i <= amount; i++) {
    addMine();
  }
}

function addMine() {
  var location = findEmptyLocation();
  gBoard[location.i][location.j].isMine = true;
}

function findEmptyLocation() {
  var emptyLocations = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (!gBoard[i][j].isMine) {
        emptyLocations.push({ i, j });
      }
    }
  }
  if (!emptyLocations.length) return;
  return emptyLocations[getRandomInt(0, emptyLocations.length - 1)];
}

function restart() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine) {
        gBoard[i][j].isMine = false;
      }
    }
  }
  initGame();
}
function hintsOn() {
  gIsHint = true;
}

function hintOff() {
  gIsHint = false;
}

function htmlHintsCounter() {
  const elHint = document.querySelector(".hints");
  elHint.innerHTML = `${updateHints()}`;
}

function updateHints() {
  var str = "";
  if (gHintLeft === 0) {
    str = "no more hints";
  } else {
    for (var i = 1; i <= gHintLeft; i++) {
      str += HINT;
    }
  }
  return str;
}

function onCellMarked(elCell,i,j) {
  const cell=document.querySelector(`.cell-${i}-${j}`)
  const elMines = document.querySelector(".negmine");
  if(gBoard[i][j].isMarked){
    gMarked++
    cell.innerHTML=EMPTY_IMG
    gBoard[i][j].isMarked=false
  }else{
    if(gMarked===0){
      alert('u finished all your flags')
      return
    }
    gMarked--
    cell.innerHTML=FLAG_IMG
    gBoard[i][j].isMarked=true
  }
  elMines.innerHTML = gMarked
}

function checkGameOver() {
  for(var i=0;i<gBoard.length;i++){
    for (var j=0;j<gBoard[i].length;j++){
      if(gBoard[i][j].isMine && !gBoard[i][j].isMarked){
        return
      }else{
      gameWinner()
      }
    }
  }
}
function gameWinner(){
  alert('yay winner')
}
function gameLoser(){}

function expandShown(board, elCell, rowIdx, colIdx) {
  if (board[rowIdx][colIdx].isMine) return;
  if (board[rowIdx][colIdx].minesAroundCount !== 0) return;
  // elCell.innerHTML = checkMinesAroundCount(rowIdx, colIdx);
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      if (board[i][j].isShown) continue;
      if (i === rowIdx && j === colIdx) continue;
      const cell = document.querySelector(`.cell-${i}-${j}`);
      // console.log("test " + cell.innerHTML);

      // debugger
      // console.log(board[i][j].minesAroundCount);
      // console.log('i: '+ i+' j: '+j+ 'count: '+board[i][j].minesAroundCount);
      if (board[i][j].minesAroundCount === 0) {
        // cell.innerHTML = EMPTY_IMG
        cell.innerHTML = checkMinesAroundCount(i, j);
        board[i][j].isShown = true;
        expandShown(board, elCell, i, j);

        if (board[i][j].minesAroundCount > 0) {
          cell.innerHTML = checkMinesAroundCount(i, j);
        }
      }
    }
  }
}

function updateLives() {
  const elLives = document.querySelector(".lives");
  elLives.innerHTML = `${gLivesLeft}`;
  const elBtn = document.querySelector(".restartBtn");
  elBtn.innerHTML = `${gFlow[gLivesLeft]}`;
}
function winner() {
  const elBtn = document.querySelector(".restartBtn");
  elBtn.innerHTML = `${WINNER}`;
}

// function updateLastUser(){
  // var newName=prompt(`${gLastUser} was the last player. \מ try to beat his ${gLastScore} score! \מ  whats ur name?`)
  // localStorage.setItem()
  // gLastUser=newName
// }