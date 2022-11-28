//include additional files
import * as addFunc from "./extending_functions";
import * as ga from "./ga";

//---------------------------------
//---------------------------------

//map setup
const canvas = document.getElementById("map");

const bck_canvas = document.createElement("canvas");
bck_canvas.width = canvas.width;
bck_canvas.height = canvas.height;

const bck_ctx = bck_canvas.getContext("2d");
const ctx = canvas.getContext("2d");

const map = new Image();
map.src = "src/map.bmp";
map.crossOrigin = "anonymous";

const start_btn = document.getElementById("start");
start_btn.addEventListener("click", game);

async function loadMap() {
  map.onload = () => {
    Promise.all([
      createImageBitmap(map, 0, 0, 128, 128, {
        resizeWidth: 584,
        resizeHeight: 584,
        resizeQuality: "pixelated"
      })
    ]).then((map) => {
      ctx.drawImage(map[0], 0, 0);
    });
  };
}
loadMap();

function saveMapBackup() {
  bck_ctx.drawImage(canvas, 0, 0);
}
function loadMapBackup() {
  ctx.drawImage(bck_canvas, 0, 0);
}

//---------------------------------
//---------------------------------

//init starting variables
let cities = [];
const pointsCount = 10;
let user_picks = [];
let user_distance = 0;

//init GA variables
const popSize = 10;
const fitness = [];
const gens = 10000;

let population = [];
let recordDistance = Infinity;
let bestEver;
let currentBest;
let counter = 0;

//populate map after start
const populate_map = (pointsCount) => {
  //init array for points on map
  let citiesOrder = [];

  //create cities
  for (let i = 0; i < pointsCount; i++) {
    let point = addFunc.getRandomPoint();

    citiesOrder[i] = i;

    //prevent from setting cities too close each others
    if (cities.length > 0) {
      while (addFunc.isSimilar(cities, point)) {
        point = addFunc.getRandomPoint();
      }
    }

    let btn = document.createElement("button");
    const canvas = document.getElementById("map-wrapper");
    btn.classList.add("btn");
    btn.setAttribute("id", i);
    btn.style.left = point.x - 16 + "px";
    btn.style.top = point.y - 16 + "px";
    canvas.appendChild(btn);

    //create city object
    cities.push({ btn: btn, x: point.x, y: point.y });
  }

  //create initial population
  for (let i = 0; i < popSize; i++) {
    population[i] = addFunc.shuffle([...citiesOrder]);
  }

  //setup hoovers funcionalities for cities
  cities.forEach((point) => {
    cities.forEach((e, index) => {
      point[index] = addFunc.calculateDistance(point, e);
    });
    point.btn.addEventListener("mouseover", (e) => {
      saveMapBackup();
      addFunc.drawLines(ctx, cities, cities[e.target.id]);
    });
    point.btn.addEventListener("mouseleave", () => {
      loadMapBackup();
      if (user_picks.length > 1) {
        addFunc.drawLineBetween(
          ctx,
          user_picks[user_picks.length - 2],
          user_picks[user_picks.length - 1]
        );
      }
    });
    point.btn.addEventListener("click", (e) => {
      addFunc.userRoad(user_picks, cities, user_distance, e);
    });
  });
};

async function runGA() {
  saveMapBackup();
  //gen 0 init
  currentBest = simulateEvolution();

  //set evolution for gens 1-x
  for (let i = 0; i < gens; i++) {
    let genBest = simulateEvolution();
    if (currentBest < genBest) {
      currentBest = genBest;
    }
  }
}

function simulateEvolution() {
  //caluclate fitness
  population.forEach(async (el, index) => {
    await addFunc.drawRoad(ctx, cities, el);

    let dist = 0;
    for (let i = 0; i < 9; i++) {
      let current_pos = cities[el[i]];
      let next_pos = el[i + 1];
      dist += current_pos[next_pos];
    }

    if (dist < recordDistance) {
      recordDistance = dist;
      bestEver = el;
    }

    fitness[index] = 1 / (dist + 1);
    await loadMapBackup();
    console.log(el);
  });

  let currentBest = bestEver;

  //normalise fitness
  let sum = 0;

  for (let i = 0; i < fitness.length; i++) {
    sum += fitness[i];
  }
  for (let i = 0; i < fitness.length; i++) {
    fitness[i] = fitness[i] / sum;
  }

  //generate new population
  const newPopulation = [];
  for (let i = 0; i < population.length; i++) {
    const orderA = pickOne(population, fitness);
    const orderB = pickOne(population, fitness);
    const order = crossOver(orderA, orderB);
    mutate(order, 0.01);
    newPopulation[i] = order;
  }
  population = newPopulation;

  return currentBest;
}

function pickOne(list, prob) {
  let index = 0;
  let r = Math.random(1);

  while (r > 0) {
    r = r - prob[index];
    index++;
  }
  index--;
  return list[index].slice();
}

function crossOver(orderA, orderB) {
  const start = Math.floor(Math.random(orderA.length));
  const end = Math.floor(Math.random(start + 1, orderA.length));
  const neworder = orderA.slice(start, end);
  for (let i = 0; i < orderB.length; i++) {
    const city = orderB[i];
    if (!neworder.includes(city)) {
      neworder.push(city);
    }
  }
  return neworder;
}

function mutate(order, mutationRate) {
  for (let i = 0; i < 10; i++) {
    if (Math.random(1) < mutationRate) {
      const indexA = Math.floor(Math.random(order.length));
      const indexB = (indexA + 1) % 10;
      swap(order, indexA, indexB);
    }
  }
}

function swap(a, i, j) {
  const temp = a[i];
  a[i] = a[j];
  a[j] = temp;
}

async function game() {
  alert(
    "Za chwilę rozpocznie się rozgrywka! Masz 30 sekund na odnalezienie najlepszej drogi. Powodzenia!"
  );
  populate_map(pointsCount);
  runGA();

  // await addFunc.runTimer(30);
  // if (user_picks.length === 10) {
  //   alert(
  //     "Gratulacje. Udało Ci się stworzyć pełną ścieżkę. Ciekawe jak wypadniesz w pojedynku z magiczną mapą?"
  //   );
  // } else {
  //   alert(
  //     "Nie udało Ci się zaznaczyć wszystkich punktów w wyznaczonym czasie! Przegrywasz :( Mapa zostanie zresetowana"
  //   );
  //   resetGame();
  // }
}
