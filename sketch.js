let data; // dati CSV
let minLat, minLon, maxLat, maxLon; // limiti di latitudine e longitudine
let margin = 70;
let chartW, chartH; // dimensioni del grafico
let img; // mappa
let hovered = null; // variabile per tenere traccia del vulcano sotto il cursore

function preload() {
  data = loadTable("data.csv", "csv", "header");
  img = loadImage('worldmap.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Helvetica");

  let allLat = [];
  let allLon = [];

  // ciclo per prendere tutte le coordinate valide di latitudine e longitudine
  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));

    if (!isNaN(lat) && !isNaN(lon)) {
      allLat.push(lat);
      allLon.push(lon);
    }
  }

  // valori minimi e massimi per latitudine e longitudine
  minLat = min(allLat);
  maxLat = max(allLat);
  minLon = min(allLon);
  maxLon = max(allLon);

  // dimensioni del grafico
  chartW = width * 0.8;
  chartH = height * 0.9;
}

// funzione che apre la pagina di dettaglio
function mousePressed() {
  if (hovered) {
    let myUrl = 'detail.html?id=' + encodeURIComponent(hovered.id);
    window.location.href = myUrl;
  }
}

function draw() {
  background(10);
  image(img, margin, margin, chartW - margin * 1.5, chartH - margin * 1.5);

  fill("white");
  textSize(26);
  textAlign(LEFT);
  text("Volcanoes of the World", margin, margin - 5 - 12); // titolo

  // rettangolo del grafico
  noFill();
  stroke(100);
  rect(margin, margin, chartW - margin * 1.5, chartH - margin * 1.5);
  noStroke();

  // variabili per il vulcano più vicino
  let closestDist = Infinity;
  let closestRow = null;
  let closestX, closestY;

  // ciclo per disegnare ogni vulcano
  for (let i = 0; i < data.getRowCount(); i++) {
    // latitudine, longitudine e altitudine
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));
    let elev = parseFloat(data.getString(i, "Elevation (m)"));

    // salta i dati non validi
    if (isNaN(lat) || isNaN(lon)) continue;

    // mappa le coordinate reali su coordinate x, y
    let x = map(lon, minLon, maxLon, margin, chartW - margin);
    let y = map(lat, minLat, maxLat, chartH - margin, margin);
    let radius = 3;

    // colore in base all'altitudine
    let t = map(elev, -6000, 7000, 0, 1);
    let col = lerpColor(color(0, 0, 150), color(150, 255, 150), constrain(t, 0, 1));

    // distanza mouse - vulcano
    let d = dist(x, y, mouseX, mouseY);

    // se il mouse è sopra un pallino, memorizza il più vicino
    if (d < radius) {
      if (d < closestDist) {
        closestDist = d;
        closestRow = i;
        closestX = x;
        closestY = y;
      }
    }

    // disegna il pallino del vulcano
    fill(col);
    ellipse(x, y, radius * 2);
  }

  // hover vulcano (solo il più vicino al mouse)
  if (closestRow !== null) {
    fill("red");
    ellipse(closestX, closestY, 6);

    // aggiorna l’oggetto hovered per il click
    hovered = {
      name: data.getString(closestRow, "Volcano Name"),
      id: data.getString(closestRow, "Volcano Number")
    };

    // posizione legenda
    let legendX2 = chartW + 20;
    let legendY2 = margin + 30;

    // info vulcano
    let name = data.getString(closestRow, "Volcano Name");
    let country = data.getString(closestRow, "Country");
    let typeCat = data.getString(closestRow, "TypeCategory");
    let type = data.getString(closestRow, "Type");
    let num = data.getString(closestRow, "Volcano Number");
    let status = data.getString(closestRow, "Status");
    let erup = data.getString(closestRow, "Last Known Eruption");
    let elev = data.getString(closestRow, "Elevation (m)");
    let lat = data.getString(closestRow, "Latitude");
    let lon = data.getString(closestRow, "Longitude");

    // testo vulcano
    fill("white");
    textSize(12);
    textAlign(LEFT);
    text(name + " (" + country + ")", legendX2, legendY2 + 200);
    text("N. " + num, legendX2, legendY2 + 230);
    text("Type: " + type, legendX2, legendY2 + 250);
    text("Category: " + typeCat, legendX2, legendY2 + 270);
    text("Lat: " + lat, legendX2, legendY2 + 290);
    text("Lon: " + lon, legendX2, legendY2 + 310);
    text(elev + " m", legendX2, legendY2 + 330);
    text(status, legendX2, legendY2 + 350);
    text("Last Known Eruption: " + erup, legendX2, legendY2 + 370);
  } else {
    hovered = null; // se non sto sopra nessun vulcano
  }

  drawLegend(); // legenda
}

function drawLegend() {
  let legendX = chartW + 20;
  let legendY = margin + 30;

  fill("white");
  textSize(14);
  text("Map legend", legendX, legendY);

  // gradient altitudine nella legenda
  let gradH = 120; // altezza barra
  for (let i = 0; i <= gradH; i++) {
    let inter = i / gradH;
    let c = lerpColor(color(150, 255, 150), color(0, 0, 150), inter);
    stroke(c);
    line(legendX, legendY + 30 + i, legendX + 20, legendY + 30 + i);
  }

  // etichette legenda
  noStroke();
  fill("white");
  textSize(12);
  text("+7000 m", legendX + 30, legendY + 35);
  text("-6000 m", legendX + 30, legendY + 35 + gradH);
}
