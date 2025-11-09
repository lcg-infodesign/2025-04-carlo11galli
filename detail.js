let data;

function preload() {
  data = loadTable('data.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(10);
  textFont("Helvetica");
  textAlign(LEFT);

  // numero del vulcano nell'URL (avevo il problema degli unnamed)
  // ho comunque il problema per quelli senza nome e senza numero
  let parameters = getURLParams();
  let volcanoId = decodeURIComponent(parameters.id || "").trim();

  let selected = null;
  for (let i = 0; i < data.getRowCount(); i++) {
    let id = data.getString(i, "Volcano Number").trim();
    if (id === volcanoId) {
      selected = data.rows[i];
      break;
    }
  }

  // TITOLO E INFO DATASET
  let textY = 70;

  fill("white");
  textSize(26);
  text(selected.get("Volcano Name"), 80, 100 + textY);

  textSize(14);
  text("Country: " + selected.get("Country"), 80, 140 + textY);
  text("Volcano Number: " + selected.get("Volcano Number"), 80, 160 + textY);
  text("Type: " + selected.get("Type"), 80, 180 + textY);
  text("Category: " + selected.get("TypeCategory"), 80, 200 + textY);
  text("Status: " + selected.get("Status"), 80, 220 + textY);
  text("Last Known Eruption: " + selected.get("Last Known Eruption"), 80, 240 + textY);
  text("Location: " + selected.get("Location"), 80, 260 + textY);
  text("Latitude: " + selected.get("Latitude"), 80, 280 + textY);
  text("Longitude: " + selected.get("Longitude"), 80, 300 + textY);
  text("Elevation: " + selected.get("Elevation (m)") + " m", 80, 320 + textY);

  // bottone Back to map
  drawBackButton();
  // grafico altitudine
  drawChart(selected);
  // linea del tempo
  drawTimeline(selected);
}

// bottone in alto a sinistra
function drawBackButton() {
  fill(255);
  textSize(12);
  text("← Back to map", 40, 40);

  // area cliccabile
  noFill();
  noStroke();
  rect(30, 20, 150, 30);
}

// click sul bottone
function mousePressed() {
  if (mouseX > 30 && mouseX < 180 && mouseY > 20 && mouseY < 50) {
    window.location.href = "index.html"; // torna alla pagina principale
  }
}

// GRAFICO ALTITUDINE
function drawChart(selected) {
  let elev = parseFloat(selected.get("Elevation (m)"));
  if (isNaN(elev)) elev = 0;

  // posizione e dimensioni del grafico
  let graphX = width * 0.75;
  let graphY = height * 0.5;
  let graphH = 600;

  // scala da -6000 a +7000 m
  let zeroY = map(0, -6000, 7000, graphY + graphH / 2, graphY - graphH / 2);
  let elevY = map(elev, -6000, 7000, graphY + graphH / 2, graphY - graphH / 2);

  // colore in base all’altitudine
  let t = map(elev, -6000, 7000, 0, 1);
  let col = lerpColor(color(0, 0, 150), color(150, 255, 150), constrain(t, 0, 1));

  // trapezio vulcano
  fill(col);
  noStroke();
  quad(
    graphX - 15, elevY + 20, // base sinistra
    graphX + 15, elevY + 20, // base destra
    graphX + 7,  elevY, // cima destra
    graphX - 7,  elevY, // cima sinistra
  );

  // etichette
  fill("white");
  textSize(26);
  textAlign(LEFT);
  text("Elevation vs Sea Level", graphX - 50, graphY - graphH / 2 - 20);
  textSize(14);
  text("+7000 m", graphX + 150, graphY - graphH / 2 + 10);
  text("0 m", graphX + 150, zeroY+4);
  text("-6000 m", graphX + 150, graphY + graphH / 2);
  text("Elevation: " + selected.get("Elevation (m)") + " m", graphX + 150, elevY+4);

  // colonna gradient
  let gradX = graphX + 70;
  let gradY1 = graphY - graphH / 2;
  let gradY2 = graphY + graphH / 2;
  let gradH = gradY2 - gradY1;

  for (let i = 0; i <= gradH; i++) {
    let inter = i / gradH;
    let c = lerpColor(color(150, 255, 150), color(0, 0, 150), inter);
    stroke(c);
    line(gradX, gradY1 + i, gradX + 20, gradY1 + i);
  }

  // asse 0 del grafico
  push();
  stroke('white');
  line(graphX - 80, zeroY, graphX + 120, zeroY);
  noStroke();
  pop();

  // asse verticale del grafico
  push();
  stroke('white');
  line(graphX+70, graphY-300, graphX+70, graphY+300);
  noStroke();
  pop();

  // asse vulcano del grafico
  push();
  stroke('red');
  line(graphX - 7,  elevY, graphX + 120, elevY);
  noStroke();
  pop();

}

// LINEA DEL TEMPO
function drawTimeline(selected) {
  let code = selected.get("Last Known Eruption").trim();

  // ordine dalla più antica (D7) alla più recente (D1)
  let codes = ["U", "D7", "D6", "D5", "D4", "D3", "D2", "D1"];

  // posizione linea
  let baseX = 80;
  let baseY = 600;
  let spacing = 80;

  // linea base
  stroke(200);
  line(baseX, baseY, baseX + (codes.length - 1) * spacing, baseY);

  // disegna tutti i punti
  textSize(12);
  textAlign(CENTER);
  for (let i = 0; i < codes.length; i++) {
    let x = baseX + i * spacing;
    noStroke();
    fill(200);
    ellipse(x, baseY, 5, 5);
    fill("white");
    text(codes[i], x, baseY + 25);
  }

  // evidenzia il codice del vulcano
  let idx = codes.indexOf(code);
  if (idx !== -1) {
    let x = baseX + idx * spacing;
    fill("red");
    noStroke();
    ellipse(x, baseY, 16, 16);
  }

  // titolo
  fill("white");
  textAlign(LEFT);
  textSize(26);
  text("Last Known Eruption Timeline", baseX, baseY - 40);
}