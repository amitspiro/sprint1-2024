"use strict";
const MINE_IMG = "💣";
const EMPTY_IMG = " ";
const EMPTY = "EMPTY";
const MINE = "MINE";
const FLAG_IMG = "🚩";
const SAFE_IMG = "🌝";
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
var gLivesLeft;
var gHintLeft = 3;
var gIsHint = false;
var gFirstClick = true;
var gMarked;
var gLastUser = "";
var gIsSafe = false
var gSafeCounter=3

//This is called when page loads
function onInit() {
  gBoard = buildBoard();
  addMines(gLevel.MINES);
  renderBoard(gBoard, ".board-container");
  updateLives();
  htmlHintsCounter();
  updateBoardMinesCount(gBoard);
  gLivesLeft = 3;
  updateLives();
  // updateLastUser()
}

//Builds the board
// Set the mines
// Call setMinesNegsCount()
// Return the created board
function buildBoard() {
  const board = createMat(gLevel.SIZE, gLevel.SIZE);
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
  var strHTML = "<table><tbody  oncontextmenu='return false'>";
  for (var i = 0; i < mat.length; i++) {
    strHTML += "<tr>";
    for (var j = 0; j < mat[0].length; j++) {
      const className = `cell cell-${i}-${j}`;
      const elCell = document.querySelector(`.cell-${i}-${j}`);

      strHTML += `<td oncontextmenu="onCellMarked(${i},${j})" onclick="onCellClicked(${i},${j})" class="${className}">`;
      // strHTML += `<td oncontextmenu="onCellMarked(${elCell},${i},${j})" onclick=" header(${location}), onCellClicked(${cell},${i},${j})" class="${className}">`;


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
  gMarked = setMinesNegsCount(mat);
}
//Count mines around each cell
// and set the cell's
// minesAroundCount.
function setMinesNegsCount(board) {
  var minesAmount = 0;
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (!board[i][j].isShown) {
        if (board[i][j].isMine) minesAmount++;
      }
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
  if(gFirstClick){
    if(gBoard[i][j].isMine){
      gBoard[i][j].isMine=false
      addMine()
      gFirstClick=false
    }
  }
  if (gBoard[i][j].isShown) return;
  if (gBoard[i][j].isMarked) return;
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  if (gIsSafe) {
    safeOff();
  }
  if (gIsHint) {
    revealCell(elCell, i, j)
    revealNeg(elCell, i, j);
    gHintLeft--;
    htmlHintsCounter();
    hintOff();
  }
  revealCell(elCell, i, j);
  if (gBoard[i][j].minesAroundCount === 0) {
    expandShown(gBoard, elCell, i, j);
    elCell.classList.add("zero");
  }

  checkGameOver();
  // console.log(gBoard[i][j]);
}
function revealNeg(newCell, rowIdx, colIdx) {
  console.log(newCell);
  // console.log("hi");
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      if (gBoard[i][j].isShown) continue;
      var newCell = document.querySelector(`cell-${i}-${j}`);
      revealCell(newCell, i, j);
      setTimeout(() => unrevealCell(newCell, i, j), 1000);
    }
  }
}
function revealCell(cell, i, j) {
  console.log(cell);
  gBoard[i][j].isShown = true;

  if (!gBoard[i][j].isMine) {
    cell.innerHTML = checkMinesAroundCount(i, j);
    if(checkMinesAroundCount(i, j)>0){
    cell.classList.add("almost");
    }
    if(checkMinesAroundCount(i, j)===0){
      cell.classList.add("zero");
      }

    //////////
    if (checkMinesAroundCount(i, j) === 0) {
      cell.innerHTML = EMPTY_IMG;
      cell.classList.add("zero");
      // console.log("hihihihihi");
    }
  } else {
    updateBoardMinesCount(gBoard);
    cell.classList.add("bomb");
    cell.innerHTML = MINE_IMG;
    if (!gIsHint) {
      gLivesLeft--;
      updateLives();
    }
  }
  if (gIsSafe) {
    setTimeout(() => unrevealCell(cell, i, j), 1000);
    gIsSafe = false;
  }
  if (gIsHint) {
    setTimeout(() => unrevealCell(cell, i, j), 1000);
    gIsHint;
  }
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
  onInit();
}
function hintsOn() {
  gIsHint = true;
}

function hintOff() {
  gIsHint = false;
}
function safeOn() {
  gIsSafe = true;
}

function safeOff() {
  // safeOn()
  gIsSafe = false;
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

function onCellMarked(i, j) {
  console.log(gBoard);
  console.log(gBoard[i][j]);

  const cell = document.querySelector(`.cell-${i}-${j}`);
  const elMines = document.querySelector(".negmine");
  console.log(cell);
  console.log(elMines);
  if (gBoard[i][j].isMarked) {
    gMarked++;
    cell.innerHTML = EMPTY_IMG;
    gBoard[i][j].isMarked = false;
  } else {
    if (gMarked === 0) {
      alert("u finished all your flags");
      return;
    }
    gMarked--;
    cell.innerHTML = FLAG_IMG;
    gBoard[i][j].isMarked = true;
  }
  elMines.innerHTML = gMarked;
  
  checkGameOver();
}

function checkGameOver() {
  var gameOver = 0;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      // if (gBoard[i][j].isMine && gBoard[i][j].isMarked===false) return
      // else if(gboard) {
      //   gameWinner();
      // }
      if (gBoard[i][j].isMine && gBoard[i][j].isMarked === false) {
      
        gameOver++;
        // console.log("hihilolo");
        // console.log(gameOver);
      }
      // }
    }
  }
  if (gameOver === 0) {
    
    updateBoardMinesCount(gBoard)
    gameWinner();
  }
}

function expandShown(board, elCell, rowIdx, colIdx) {
  if (board[rowIdx][colIdx].isMine) return;
  // if (board[rowIdx][colIdx].minesAroundCount !== 0) return;
  // elCell.innerHTML = checkMinesAroundCount(rowIdx, colIdx);
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      if (board[i][j].isShown) continue;
      if (i === rowIdx && j === colIdx) continue;
      if(board[i][j].isMarked)continue
      const cell = document.querySelector(`.cell-${i}-${j}`);
      // console.log("test " + cell.innerHTML);

      // debugger
      // console.log(board[i][j].minesAroundCount);
      // console.log('i: '+ i+' j: '+j+ 'count: '+board[i][j].minesAroundCount);
      if (board[i][j].minesAroundCount === 0) {
        cell.innerHTML = EMPTY_IMG;
        // cell.innerHTML = checkMinesAroundCount(i, j);
        cell.classList.add("zero");

        board[i][j].isShown = true;
        for (var h = i - 1; h <= i + 1; h++) {
          if (h < 0) continue;

          if (h >= gBoard.length) continue;
          for (var g = j - 1; g <= j + 1; g++) {
            if (gBoard[i][j] === gBoard[h][g]) continue;
            if (g < 0) continue;
            if (g >= gBoard.length) continue;
            // if (gBoard[h][g].minesAroundCount > 0) revealCell(h, g);
            expandShown(board, elCell, i, j);
            // if (gBoard[h][g].minesAroundCount > 0) {
            //   cell.innerHTML = checkMinesAroundCount(i, j);
            // }
          }
        }
        // if (board[i][j].minesAroundCount > 0) {
        //   cell.innerHTML = checkMinesAroundCount(i, j);
        // }
      } else {
        cell.innerHTML = checkMinesAroundCount(i, j);
        board[i][j].isShown = true;
        cell.classList.add("almost");
      }
    }
  }
}

function updateLives() {
  const elLives = document.querySelector(".lives");
  elLives.innerHTML = `${gLivesLeft}`;
  const elBtn = document.querySelector(".restartBtn");
  elBtn.innerHTML = `${gFlow[gLivesLeft]}`;
  if (gLivesLeft === 0) {
    gameLoser();
  }
}
function winner() {
  const elBtn = document.querySelector(".restartBtn");
  elBtn.innerHTML = `${WINNER}`;
}
function gameWinner() {
  updateBoardMinesCount(gBoard)
  alert("yay winner");
  // const elHead= document.querySelector(h1)
}
function gameLoser() {
  const elBtn = document.querySelector(".restartBtn");
  elBtn.innerHTML='restart'
  showMines(gBoard)
  alert("you losttttt! try again?");
}
function showMines(board){
  for(var i=0;i<board.length;i++){
    for(var j=0;j<board[0].length;j++){
      if(board[i][j].isMine===false)continue
      const elCell = document.querySelector(`.cell-${i}-${j}`)
      if(board[i][j].isMine){
        revealCell(elCell, i, j)
      }
    }
  }
}
function easyLevel() {
  gLevel.SIZE = 4;
  gLevel.MINES = 2
  onInit();
  // renderBoard(gBoard)
}
function mediumLevel() {

  gLevel.SIZE = 8;
  gLevel.MINES = 14;
  onInit();
}
function hardLevel() {

  gLevel.SIZE = 12;
  gLevel.MINES = 32;
  console.log(gBoard);

  onInit();
  console.log(gBoard);

}
function safe(){
  var location= getEmptyCell()
  console.log(location);
  const elCell= document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML=SAFE_IMG
  setTimeout(()=>safeOut(elCell),3000)
}

function safeOut(cell) {
cell.innerHTML=EMPTY_IMG
}

function getEmptyCell() {
  var locations = [];
  while (gSafeCounter > 0) {
    for (var i = 0; i < gBoard.length; i++)
      for (var j = 0; j < gBoard[0].length; j++) {
        // console.log(locations);
        if (gBoard[i][j].isMine) continue;
        if (gBoard[i][j].isShown) continue;
        // console.log(gBoard[i][j])
        locations.push({ i: i, j: j });
      }
    gSafeCounter--;
  }
  if (!locations.length) return;
  return locations[[getRandomInt(0, locations.length - 1)]];
}

function dark(){
  const elBody=document.querySelector('body')
  elBody.style.backgroundColor='black'
}

function light(){
  const elBody=document.querySelector('body')
  elBody.style.backgroundColor='antiquewhite'
}

// function updateLastUser(){
// var newName=prompt(`${gLastUser} was the last player. \מ try to beat his ${gLastScore} score! \מ  whats ur name?`)
// localStorage.setItem()
// gLastUser=newName
// }
