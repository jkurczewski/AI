//returns random int from 0 to max
export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//returns random point on two dimensional map
export function getRandomPoint() {
  let x = getRandomInt(519) + 32;
  let y = getRandomInt(519) + 32;
  return { x: x, y: y };
}

//check if given array has similar point for passed one
export function isSimilar(array, point) {
  let isSimilar = 0;

  array.forEach((e) => {
    if (
      point.x < e.x + 64 &&
      point.x > e.x - 64 &&
      point.y < e.y + 64 &&
      point.y > e.y - 64
    ) {
      isSimilar = 1;
    }
  });

  return isSimilar;
}

export function drawLines(ctx, array, item) {
  array.forEach((el) => {
    drawLineBetween(ctx, item, el);
  });
}

export function drawRoad(ctx, cities, array) {
  for (let i = 0; i < array.length - 1; i++) {
    let start = cities[array[i]];
    let end = cities[array[i + 1]];
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
}

export function drawLineBetween(ctx, p_A, p_B) {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(p_A.x, p_A.y);
  ctx.lineTo(p_B.x, p_B.y);
  ctx.stroke();

  const p_cx = (p_A.x + p_B.x) / 2;
  const p_cy = (p_A.y + p_B.y) / 2;

  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillRect(p_cx - 26, p_cy - 26, 32, 24);

  ctx.fillStyle = "black";
  ctx.font = "16px Calibri";
  ctx.fillText(calculateDistance(p_A, p_B), p_cx - 10, p_cy - 10);

  return ctx;
}

export function calculateDistance(p_A, p_B) {
  let p_x = p_B.x - p_A.x;
  let p_y = p_B.y - p_A.y;

  let distance = Math.round(Math.sqrt(Math.pow(p_x, 2) + Math.pow(p_y, 2)));
  return distance;
}

function getPoint(cities, p) {
  return cities[p.target.id];
}

//return distance between given points
export function userRoad(user_picks, cities, user_distance, point) {
  const p = getPoint(cities, point);
  user_picks.push(p);
  p.btn.style.setProperty("border", "6px solid red", "important");
  p.btn.style.setProperty("background-color", "yellow", "important");
  p.btn.innerHTML = user_picks.length;

  if (user_picks.length > 1) {
    user_distance += calculateDistance(
      user_picks[user_picks.length - 2],
      user_picks[user_picks.length - 1]
    );
  }

  return user_distance;
}

//simple Timer func with Promise
export function runTimer(t) {
  const time = document.getElementById("timer");
  time.innerHTML = t;
  const timer = setInterval(() => {
    if (time.innerHTML - 1 === -1) {
      clearInterval(timer);
      return 1;
    }
    time.innerHTML -= 1;
  }, 1000);

  return new Promise((res) => {
    setTimeout(res, t * 1);
  });
}

//game reset
export function resetGame() {
  window.location.reload();
}

export function shuffle(a) {
  let array = a;
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
