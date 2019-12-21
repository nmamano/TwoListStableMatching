//credits for the base of the interaction-handling logic:
//https://dzone.com/articles/gentle-introduction-making
//rest by Nil M.

var yOffset = 10;
var menXOffset = 10;
var womXOffset = 430;
var planeSize = 400;
var personRadius = 10;
var personWidth = 1;
var xLoverColor = 'red';
var yLoverColor = 'blue';
var xLoverColor2 = 'red';
var yLoverColor2 = 'blue';
var soulmateColor = 'green';
var stablePairColor = 'black';


//////////////////////////////
// utils
//////////////////////////////
function randBetween(i, j) { //both inclusive
  return Math.floor((Math.random() * (j-i+1)) + i);
}

//distance between (x1,y1) and (x2,y2)
function dist(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  var c = Math.sqrt( a*a + b*b );
  return c;
}

/////////////////////////////
// Person class
/////////////////////////////
//unique id counters for men and women
var manId = 0;
var womId = 0;

function inManPlane(x, y) {
  return x >= menXOffset && x <= menXOffset+planeSize &&
         y >= yOffset && y <= yOffset+planeSize;
}

function inWomPlane(x, y) {
  return x >= womXOffset && x <= womXOffset+planeSize &&
         y >= yOffset && y <= yOffset+planeSize;
}

// Constructor for points that will represent people.
function Person(x, y, pref) {
  this.pref = pref; //'x' or 'y'
  if (inManPlane(x,y)) this.sex = 'm';
  else if (inWomPlane(x,y)) this.sex = 'w';
  else alert("what u doing");
  if (this.sex == 'm') {
    this.id = manId;
    manId++;
  } else {
    this.id = womId;
    womId++;
  }
  this.setX(x);
  this.setY(y);
}

function randomMan() {
  let offset = personRadius*4;
  var pref = 'x';
  if (randBetween(0,1) === 0) pref = 'y';
  var p = new Person(menXOffset+1, yOffset+1, pref);
  p.x = randBetween(offset, planeSize-1-offset);
  p.y = randBetween(offset, planeSize-1-offset);
  return p;
}

function randomWoman() {
  let offset = personRadius*4;
  var pref = 'x';
  if (randBetween(0,1) === 0) pref = 'y';
  var p = new Person(womXOffset+1, yOffset+1, pref);
  p.x = randBetween(offset, planeSize-1-offset);
  p.y = randBetween(offset, planeSize-1-offset);
  return p;
}

Person.prototype.toString = function() {
  return this.sex.concat(this.pref).concat('(').concat(this.x.toString()).concat(',').concat(this.y.toString()).concat(')');
}

Person.prototype.setX = function(x) {
  var newX;
  if (this.sex === 'm') newX = x - menXOffset;
  else newX = x - womXOffset;
  if (newX < 0) this.x = 0;
  else if (newX >= planeSize) this.x = planeSize-1;
  else this.x = newX;
}

Person.prototype.setY = function(y) {
  var newY = yOffset + planeSize - y;
  if (newY < 0) this.y = 0;
  else if (newY >= planeSize) this.y = planeSize-1;
  else this.y = newY;
}

Person.prototype.xPos = function() {
    if (this.sex === 'm') return this.x + menXOffset;
    return this.x + womXOffset;
}

Person.prototype.yPos = function() {
    return yOffset + planeSize - this.y;
}

// Draws this shape to a given context
Person.prototype.draw = function(ctx, label, color) {
  let oldColor = ctx.strokeStyle;
  if (label == this.pref) {
    if (this.pref === 'x') {
      ctx.strokeStyle = color || xLoverColor;
      ctx.fillStyle = color || xLoverColor;
    } else {
      ctx.strokeStyle = color || yLoverColor;
      ctx.fillStyle = color || yLoverColor;
    }
  } else {
    if (this.pref === 'x') {
      ctx.strokeStyle = color || xLoverColor2;
      ctx.fillStyle = color || xLoverColor2;
    } else {
      ctx.strokeStyle = color || yLoverColor2;
      ctx.fillStyle = color || yLoverColor2;
    }
  }
  ctx.font = "20px Arial";
  ctx.fillText(label,this.xPos()-personRadius/2, this.yPos()+personRadius/2);
  ctx.lineWidth = personWidth;
  ctx.beginPath();
  ctx.arc(this.xPos(), this.yPos(), personRadius, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.strokeStyle = oldColor;
  ctx.fillStyle = oldColor;
}

// Determine if a point is inside the person's bounds
Person.prototype.contains = function(mx, my) {
  // used to make sure the Mouse X,Y fall in the circle of the person
  return dist(this.xPos(), this.yPos(), mx, my) <= personRadius;
}

Person.prototype.score = function(p2) {
  if (this.pref === 'x') return p2.x;
  return p2.y;
}

// Check whether control button is pressed
$(document).keydown(function(event) {
    if (event.which == "17")
        cntrlIsPressed = true;
    else if (event.which == 65 && cntrlIsPressed) {
        // Cntrl+  A
        selectAllRows();
    }
});

$(document).keyup(function() {
    cntrlIsPressed = false;
});

var cntrlIsPressed = false;

function CanvasState(canvas) {

  // **** First some setup! ****
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');
  // This complicates things a little but fixes mouse co-ordinate problems
  // when there's a border or padding. See getMouse for more detail
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
  }
  // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;

  // **** Keep track of state! ****

  this.valid = false; // when set to false, the canvas will redraw everything
  this.people = [];
  this.matching = null;
  this.dragging = false; // Keep track of when we are dragging
  // the current selected object. In the future we could turn this into an array for multiple selection
  this.selection = null;
  this.dragoffx = 0; // See mousedown and mousemove events for explanation
  this.dragoffy = 0;

  var myState = this;

  //options
  this.selectionColor = 'black';
  this.selectionWidth = 2;
  this.interval = 30;
  setInterval(function() { myState.draw(); }, myState.interval);

  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  // Up, down, and move are for dragging
  canvas.addEventListener('mousedown', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var people = myState.people;
    var l = people.length;
    for (var i = l-1; i >= 0; i--) {
      if (people[i].contains(mx, my)) {
        var mySel = people[i];
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        myState.dragoffx = mx - mySel.xPos();
        myState.dragoffy = my - mySel.yPos();
        myState.dragging = true;
        myState.selection = mySel;
        myState.matching = null;
        myState.valid = false;
        return;
      }
    }
    // havent returned means we have failed to select anything.
    // If there was an object selected, we deselect it
    if (myState.selection) {
      myState.selection = null;
      myState.valid = false; // Need to clear the old selection border
    }
  }, true);
  canvas.addEventListener('mousemove', function(e) {
    if (myState.dragging){
      var mouse = myState.getMouse(e);
      // We don't want to drag the object by its top-left corner, we want to drag it
      // from where we clicked. Thats why we saved the offset and use it here
      myState.selection.setX(mouse.x - myState.dragoffx);
      myState.selection.setY(mouse.y - myState.dragoffy);
      myState.valid = false; // Something's dragging so we must redraw
    }
  }, true);
  canvas.addEventListener('mouseup', function(e) {
    myState.dragging = false;
  }, true);
  // double click for making new people
  canvas.addEventListener('dblclick', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var found = false;
    var people = myState.people;
    var l = people.length;
    for (var i = 0; i < l; i++) {
      var person = people[i];
      if (person.contains(mx, my)) {
        if (people[i].pref === 'x') people[i].pref = 'y';
        else people[i].pref = 'x';
        found = true;
        myState.matching = null;
        myState.valid = false;
      }
    }
    if (!found) {
      var pref;
      if (!cntrlIsPressed) pref = 'x';
      else pref = 'y';
      var p = new Person(mx, my, pref);
      myState.people.push(p);
      myState.valid = false;
      updatePeopleCounters(myState.people);
    }
  }, true);
  canvas.addEventListener('keydown', function(e) {
    if((e.keyCode == 46 || e.keyCode == 8) && myState.selection !== null) {
      let p = myState.selection;
      let people = myState.people;
      let SM = soulMate(p, people);
      myState.removePerson(p);
      if (SM != null && !cntrlIsPressed) myState.removePerson(SM);

      myState.valid = false;
      myState.selection = null;
      updatePeopleCounters(myState.people);
    }
  }, true);

}

CanvasState.prototype.removePerson = function(person) {
  var found = false;
  var pos;
  for (var i = 0; i < this.people.length; i++) {
    var p2 = this.people[i];
    if (samePerson(person, p2)) {
      found = true;
      pos = i;
      break;
    }
  }
  if (found) this.people.splice(pos, 1);
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

function getTopValues(people) {
  var mxx = -1, mxy = -1, myx = -1, myy = -1, wxx = -1, wxy = -1, wyx = -1, wyy = -1;
  var l = people.length;
  for (var i = 0; i < l; i++) {
    var p = people[i];
    if (p.sex === 'm') {
      if (p.pref === 'x') {
        if (mxx === -1 || p.x > mxx) mxx = p.x;
        if (mxy === -1 || p.y > mxy) mxy = p.y;
      } else {
        if (myx === -1 || p.x > myx) myx = p.x;
        if (myy === -1 || p.y > myy) myy = p.y;
      }
    } else {
      if (p.pref === 'x') {
        if (wxx === -1 || p.x > wxx) wxx = p.x;
        if (wxy === -1 || p.y > wxy) wxy = p.y;
      } else {
        if (wyx === -1 || p.x > wyx) wyx = p.x;
        if (wyy === -1 || p.y > wyy) wyy = p.y;
      }
    }
  }
  return {menxx: mxx, menxy: mxy, menyx: myx, menyy: myy, womxx: wxx, womxy: wxy, womyx: wyx, womyy: wyy};
}

function getTopPeople(people) {
  let extr = getTopValues(people);
  let mxx = undefined, mxy = undefined, myx = undefined, myy = undefined;
  let wxx = undefined, wxy = undefined, wyx = undefined, wyy = undefined;
  for (let i = 0; i < people.length; i++) {
    let p = people[i];
    if (p.sex == 'm') {
      if (p.pref == 'x') {
        if (p.x == extr.menxx) mxx = p;
        if (p.y == extr.menxy) mxy = p;
      } else {
        if (p.x == extr.menyx) myx = p;
        if (p.y == extr.menyy) myy = p;
      }
    } else {
      if (p.pref == 'x') {
        if (p.x == extr.womxx) wxx = p;
        if (p.y == extr.womxy) wxy = p;
      } else {
        if (p.x == extr.womyx) wyx = p;
        if (p.y == extr.womyy) wyy = p;
      }
    }
  }
  return {menxx: mxx, menxy: mxy, menyx: myx, menyy: myy, womxx: wxx, womxy: wxy, womyx: wyx, womyy: wyy};
}

function getTopPeopleList(people) {
  let P = getTopPeople(people);
  let A = Object.values(P);
  let uniqA = [];
  for (let i = 0; i < A.length; i++) {
    if (A[i] != undefined) {
      let repeated = false;
      for (let j = 0; j < uniqA.length; j++) {
        if (samePerson(A[i], uniqA[j])) repeated = true;
      }
      if (! repeated) uniqA.push(A[i]);
    }
  }
  return uniqA;
}

function getLabel(p, extremes) {
  // let prefix = p.id.toString();
 let prefix = p.pref;
  if (p.sex === 'm') {
    if (p.pref === 'x') {
      if (p.x == extremes.menxx && p.y == extremes.menxy) return prefix.concat(' (x,y)');
      if (p.x == extremes.menxx) return prefix.concat(' (x)');
      if (p.y == extremes.menxy) return prefix.concat(' (y)');
      return prefix;
    } else {
      if (p.x == extremes.menyx && p.y == extremes.menyy) return prefix.concat(' (x,y)');
      if (p.x == extremes.menyx) return prefix.concat(' (x)');
      if (p.y == extremes.menyy) return prefix.concat(' (y)');
      return prefix;
    }
  } else {
    if (p.pref === 'x') {
      if (p.x == extremes.womxx && p.y == extremes.womxy) return prefix.concat(' (x,y)');
      if (p.x == extremes.womxx) return prefix.concat(' (x)');
      if (p.y == extremes.womxy) return prefix.concat(' (y)');
      return prefix;
    } else {
      if (p.x == extremes.womyx && p.y == extremes.womyy) return prefix.concat(' (x,y)');
      if (p.x == extremes.womyx) return prefix.concat(' (x)');
      if (p.y == extremes.womyy) return prefix.concat(' (y)');
      return prefix;
    }
  }
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
  // if our state is invalid, redraw and validate!
  if (this.valid) return;

  var ctx = this.ctx;
  let oldColor = ctx.strokeStyle;
  var people = this.people;
  this.clear();

  // ** Add stuff you want drawn in the background all the time here **

  // draw all people
  var l = people.length;
  var extremes = getTopValues(people);
  for (let i = 0; i < l; i++) {
    var person = people[i];
    if (soulMate(person, people) == undefined) {
      person.draw(ctx, getLabel(person, extremes));
    } else {
      person.draw(ctx, getLabel(person, extremes), soulmateColor);
    }
  }

  if (this.matching != null) {
    lists = getListsBySex(people);
    for (let i = 0; i < lists.W.length; i++) {
      let w = lists.W[i];
      let m = lists.M[this.matching[i]];
      if (m.pref === 'x') {
        ctx.strokeStyle = xLoverColor;
        ctx.fillStyle = xLoverColor;
      } else {
        ctx.strokeStyle = yLoverColor;
        ctx.fillStyle = yLoverColor;
      }
      let xpos = w.xPos()-2.25*personRadius;
      if (i >= 10) xpos -= personRadius;
      let ypos = w.yPos()+personRadius/2;
      ctx.fillText(i.toString(),xpos,ypos);
      xpos = m.xPos()-2.25*personRadius;
      if (i >= 10) xpos -= personRadius;
      ypos = m.yPos()+personRadius/2;
      ctx.fillText(i.toString(),xpos,ypos);
    }
    ctx.strokeStyle = oldColor;
    ctx.fillStyle = oldColor;
  }
  // draw selection
  // right now this is just a stroke along the edge of the selected person
  if (this.selection != null) {
    ctx.strokeStyle = this.selectionColor;
    var mySel = this.selection;
    ctx.beginPath();
    ctx.arc(mySel.xPos(), mySel.yPos(), personRadius+3, 0, Math.PI * 2, true);
    ctx.stroke();
    if (getNumsBySex(this.people).M == getNumsBySex(this.people).W) {
      let SP = getStablePairs(mySel, this.people);
      ctx.strokeStyle = stablePairColor;
      ctx.lineWidth = this.selectionWidth*5;
      for (let i = 0; i < SP.length; i++) {
        SP[i].draw(ctx, getLabel(SP[i], extremes), stablePairColor);
        ctx.beginPath();
        ctx.arc(SP[i].xPos(), SP[i].yPos(), personRadius+3, 0, Math.PI * 2, true);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = oldColor;
  }

  // ** Add stuff you want drawn on top all the time here **
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(menXOffset,yOffset,planeSize,planeSize);
  ctx.strokeRect(womXOffset,yOffset,planeSize,planeSize);

  this.valid = true;
}

// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;

  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my};
}






//generates n men and n women
//no repeated coordinates on either set
function randomPeople(n) {
  var ppl = []
  for (var i = 0; i < n; i++) {
    var repeated = true;
    var m = randomMan();
    while (repeated) {
      repeated = false;
      for (var j = 0; j < 2*i; j++) {
        if (ppl[j].sex === 'm' && (ppl[j].x === m.x || ppl[j].y === m.y)) {
          repeated = true;
        }
      }
      if (repeated) m = randomMan();
    }
    ppl.push(m);
    repeated = true;
    var w = randomWoman();
    while (repeated) {
      repeated = false;
      for (var j = 0; j < 2*i; j++) {
        if (ppl[j].sex === 'w' && (ppl[j].x === w.x || ppl[j].y === w.y)) {
          repeated = true;
        }
      }
      if (repeated) w = randomWoman();
    }
    ppl.push(w);
  }
  return ppl;
}

////////////////////////////
// application logic
////////////////////////////

function samePerson(p1, p2) {
  return p1.sex == p2.sex && p1.id == p2.id;
}

function firstChoice(p, people) {
  let l = people.length;
  let bestScore = -1;
  let FC;
  for (let i = 0; i < l; i++) {
    let p2 = people[i];
    if (p2.sex != p.sex) {
      if (bestScore === -1 || bestScore < p.score(p2)) {
        FC = p2;
        bestScore = p.score(p2);
      }
    }
  }
  return FC;
}

function soulMate(p, people) {
  let p2 = firstChoice(p, people);
  let p3 = firstChoice(p2, people);
  if (samePerson(p, p3)) {
    return p2;
  } else {
    return undefined;
  }
}

function getNumsBySex(people) {
  let numMen = 0;
  for (let i = 0; i < people.length; i++) {
    if (people[i].sex == 'm') numMen++;
  }
  return {M: numMen, W: people.length - numMen};
}

function getListsBySex(people) {
  let nums = getNumsBySex(people);
  let ML = new Array(nums.M);
  let WL = new Array(nums.W);
  let Mcount = 0, Wcount = 0;
  for (let i = 0; i < people.length; i++) {
    if (people[i].sex == 'm') {
      ML[Mcount] = people[i];
      Mcount++;
    } else {
      WL[Wcount] = people[i];
      Wcount++;
    }
  }
  return {M: ML, W: WL};

}

//L[i] = index of the i-th most preferred women
function prefList(p, people) {
  let L = new Array(people.length);
  for (let i = 0; i < L.length; i++) {
    L[i] = i;
  }
  L.sort(function(i,j){ //careful with tie resolution here
    if (p.pref == 'x') return people[i].x >= people[j].x ? -1 : 1;
    else return people[i].y >= people[j].y ? -1 : 1;
  });
  return L;
}

function prefMatrixBySex(lists) {
  let prefM = new Array(lists.M.length);
  for (let i = 0; i < lists.M.length; i++) {
    prefM[i] = prefList(lists.M[i], lists.W);
  }
  let prefW = new Array(lists.W.length);
  for (let i = 0; i < lists.W.length; i++) {
    prefW[i] = prefList(lists.W[i], lists.M);
  }
  return {M: prefM, W: prefW};
}

//convert pref matrix to score matrix
function getScoreMatrix(prefM) {
    let n = prefM.length;
    let SM = new Array(n);
    for (let w = 0; w < n; w++) {
        SM[w] = new Array(n);
        for (let k = 0; k<n; k++) {
            m = prefM[w][k];
            SM[w][m] = n-k;
        }
    }
    return SM;
}

function scoreMatrixBySex(prefMatrices) {
  let SM = getScoreMatrix(prefMatrices.M);
  let SW = getScoreMatrix(prefMatrices.W);
  return {M: SM, W: SW};
}

//MP (men's preferences) is the preference matrix of the men:
//MP[i][j] is the j-th most preferred man of woman i
//WS (women's scores (of the men)) is the score matrix of the women:
//WS[i][j] is the score of man j for woman i (range from 1 to n)
//M is the man in the stable pair
//W is the woman in the stable pair
function isStablePair(M, W, MP, WS) {
  let n = MP.length;
  //index of next women to ask for each man:
  let N = new Array(n).fill(0);
  //man currently engaged to each woman
  let E = new Array(n).fill(-1);
  //score currently achieved by each woman
  let CS = new Array(n).fill(0);
  // alert('6');
  while (MP[M][N[M]] != W) {
    let t = MP[M][N[M]];
    CS[t] = WS[t][M];
    N[M] = N[M]+1;
  }
  // alert('7');
  E[W] = M;
  CS[W] = WS[W][M];
  for (let k = 0; k < n; k++) {
    let m = k;
    if (m != M) {
      while (m != -1) {
        if (N[m] == n) return false;
        let w = MP[m][N[m]];
        N[m]++;
        // alert(m.toString().concat(' proposes to ').concat(w.toString()));
        if (WS[w][m] > CS[w]) {
          // if (E[w] == -1) alert(w.toString().concat(' accepts ').concat(m.toString()));
          // else alert(w.toString().concat(' changes ').concat(E[w].toString()).concat(' for ').concat(m.toString()));
          let t = E[w];
          E[w] = m;
          CS[w] = WS[w][m];
          m = t;
          if (m == M) return false;
        } else {
          // alert(w.toString().concat(' rejects ').concat(m.toString()));
        }
      }
    }
  }
  return true;
}

function manOptMatchingAux(MP, WS) {
  let n = MP.length;
  //index of next women to ask for each man:
  let N = new Array(n).fill(0);
  //man currently engaged to each woman
  let E = new Array(n).fill(-1);
  //score currently achieved by each woman
  let CS = new Array(n).fill(0);
  for (let k = 0; k < n; k++) {
    let m = k;
    while (m != -1) {
      if (N[m] == n) alert("terrible malfunction");
      let w = MP[m][N[m]];
      N[m]++;
      if (WS[w][m] > CS[w]) {
        let t = E[w];
        E[w] = m;
        CS[w] = WS[w][m];
        m = t;
      }
    }
  }
  return E;
}

function pIndex(p, L) {
  for (let i = 0; i < L.length; i++) {
    if (samePerson(p, L[i])) return i;
  }
  alert('something went so wrong');
  return undefined;
}

function getStablePairsAux(p, lists, prefs, scores) {
  let L = [];
  if (p.sex === 'm') {
    let pi = pIndex(p, lists.M);
    for (let i = 0; i < lists.W.length; i++) {
      if (isStablePair(pi, i, prefs.M, scores.W)) L.push(lists.W[i]);
    }
  } else {
    let pi = pIndex(p, lists.W);
    for (let i = 0; i < lists.M.length; i++) {
      if (isStablePair(i, pi, prefs.M, scores.W)) L.push(lists.M[i]);
    }
  }
  return L;
}

function getStablePairs(p, people) {
  let lists = getListsBySex(people);
  let prefs = prefMatrixBySex(lists);
  let scores = scoreMatrixBySex(prefs);
  return getStablePairsAux(p, lists, prefs, scores);
}

function hasUniqueMatching(people) {
  let lists = getListsBySex(people);
  let prefs = prefMatrixBySex(lists);
  let scores = scoreMatrixBySex(prefs);
  for (let i = 0; i < people.length; i++) {
    let p = people[i];
    if (p.sex === 'm') {
      let L = getStablePairsAux(p, lists, prefs, scores);
      if (L.length > 1) return false;
    }
  }
  return true;
}

//returns a list such that L[i] is the index of the man matched to woman with index i
function manOptMatching(people) {
  let lists = getListsBySex(people);
  let prefs = prefMatrixBySex(lists);
  let scores = scoreMatrixBySex(prefs);
  return manOptMatchingAux(prefs.M, scores.W);
}

//unused for now
//allows us to quickly find men in the list
// function idToPosBySex(pLists) {
//   let MD = {}, WD = {};
//   for (let i = 0; i < pLists.M.length; i++) {
//     MD[pLists.M[i].id] = i;
//   }
//   for (let i = 0; i < pLists.W.length; i++) {
//     WD[pLists.W[i].id] = i;
//   }
//   return {M: MD, W: WD};
// }

////////////////////////////////////
//HTML interaction
////////////////////////////////////

var CS = new CanvasState(document.getElementById('canvas1'));
init();

function init() {
  populateCanvasRandom(CS, 30);
  // countUniqueMatchings();
  // findNoTopMatching();
}

function disjointPeopleLists(L1, L2) {
  for (let i = 0; i < L1.length; i++) {
    for (let j = 0; j < L2.length; j++) {
      if (samePerson(L1[i], L2[j])) return false;
    }
  }
  return true;
}

function populateCanvas(CS, people) {
  CS.people = people;
  CS.dragging = false;
  CS.selection = null;
  CS.dragoffx = 0;
  CS.dragoffy = 0;
  CS.matching = null;
  CS.valid = false;
  updatePeopleCounters(CS.people);
}

function populateCanvasRandom(CS, n) {
  populateCanvas(CS, randomPeople(n));
  spacePoints();
}

function generateRandom() {
  var text1 = document.getElementById('inputsize').value;
  let n = parseInt(text1);
  if (n > 300) {
    n = 300;
    alert('No more than 300 please');
  }

  populateCanvasRandom(CS, n);
}

function displayManOpt() {
  CS.matching = manOptMatching(CS.people);
  CS.valid = false;
}

function getInput() {
  let lists = getListsBySex(CS.people);
  document.getElementById('inputtext').innerHTML = lists.M.toString().concat(',').concat(lists.W.toString());
}

function setInput() {
  let words = document.getElementById('setinput').value.split(',');
  let people = [];
  for (let i = 0; i < words.length; i+=2) {
    let word = words[i];
    let p;
    if (word[0] == 'm') p = randomMan();
    else p = randomWoman();
    p.pref = word[1];
    p.x = parseInt(word.substring(3,word.length));
    p.y = parseInt(words[i+1].substring(0,words[i+1].length-1));
    people.push(p);
  }
  populateCanvas(CS, people);
}

function spacePoints() {
  let ppl = CS.people;
  let lists = getListsBySex(ppl);
  let n = lists.M.length;
  if (n == 1) return;
  let separation = (planeSize-6*personRadius)/(n-1);
  lists.M.sort(function(p1,p2){ //careful with tie resolution here
    return p1.x >= p2.x ? 1 : -1;
  });
  for (let i = 0; i < n; i++) {
    lists.M[i].x = 2*personRadius+i*separation;
  }
  lists.M.sort(function(p1,p2){ //careful with tie resolution here
    return p1.y >= p2.y ? 1 : -1;
  });
  separation = (planeSize-4*personRadius)/(n-1);
  for (let i = 0; i < n; i++) {
    lists.M[i].y = 2*personRadius+i*separation;
  }
  n = lists.W.length;
  if (n == 1) return;
  lists.W.sort(function(p1,p2){ //careful with tie resolution here
    return p1.x >= p2.x ? 1 : -1;
  });
  separation = (planeSize-6*personRadius)/(n-1);
  for (let i = 0; i < n; i++) {
    lists.W[i].x = 2*personRadius+i*separation;
  }
  lists.W.sort(function(p1,p2){ //careful with tie resolution here
    return p1.y >= p2.y ? 1 : -1;
  });
  separation = (planeSize-4*personRadius)/(n-1);
  for (let i = 0; i < n; i++) {
    lists.W[i].y = 2*personRadius+i*separation;
  }

  CS.people = lists.M.concat(lists.W);
  CS.valid = false;
  CS.matching = null;
}

function updatePeopleCounters(people) {
  let nums = getNumsBySex(people);
  setMenNum(nums.M);
  setWomNum(nums.W);
}

function setMenNum(n) {
  document.getElementById('mennum').innerHTML = 'Number of men: '.concat(n.toString());
}

function setWomNum(n) {
  document.getElementById('womnum').innerHTML = 'Number of women: '.concat(n.toString());
}



////////////////////////////////////
// input configurations
////////////////////////////////////

function countUniqueMatchings() {
  console.log('start');
  for (let n = 2; n < 50; n++) {
    let count = 0;
    for (let i = 0; i < 1000; i++) {
      if (hasUniqueMatching(randomPeople(n))) count++;
    }
    console.log(n+" "+count/10);
  }
}

function findHighStablePairs() {
  let n = 4;
  for (let i = 0; i < 10000000; i++) {
    let L = randomPeople(n);
    for (let j = 0; j < 2*n; j++) {
      let SP = getStablePairs(L[j], L);
      if (SP.length > 2) console.log(SP.length);
      if (SP.length > 2) {
        console.log(SP.length);
        populateCanvas(CS, L);
        return;
      }
    }
  }
}

function findNoTopMatching() {
  let n = 12;
  for (let k = 0; k < 10000000; k++) {
    let people = randomPeople(n);
    let topPeople = getTopPeople(people);
    let topList = getTopPeopleList(people);
    let lists = getListsBySex(people);
    let prefs = prefMatrixBySex(lists);
    let scores = scoreMatrixBySex(prefs);
    let disjCount = 0;
    for (let i = 0; i < topList.length; i++) {
      let stablePairs = getStablePairsAux(topList[i], lists, prefs, scores);
      if (disjointPeopleLists(topList, stablePairs)) {
        disjCount++;
      }
    }
    if (disjCount > 5) {
      console.log(disjCount);
    }
    if (disjCount > 6) {
      console.log(disjCount);
      populateCanvas(CS, people);
      return;
    }
  }
}
