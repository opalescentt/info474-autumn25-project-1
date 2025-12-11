const worldMapSketch = (p) => {

  let worldMap;
  let dataTable;

  let countryCounts = {};
  let years = [];
  let slider;
  let currentYear;
  let cumulativeCounts = {};
  let maxYearsParticipated = 1;
  let selectedCountry = null;



  const nocToIso = {
    "AUS": "AUS",
    "CAN": "CAN",
    "USA": "USA",
    "SWE": "SWE",
    "GER": "DEU",
    "GBR": "GBR",
    "FRA": "FRA",
    "CHN": "CHN",
    "JPN": "JPN",
    "BRA": "BRA",
    "ARG": "ARG",
    "HUN": "HUN",
    "NLD": "NLD",
    "NOR": "NOR",
    "NZL": "NZL",
    "RSA": "ZAF",
  
    "CRC": "CRI",   // Costa Rica
    "SUI": "CHE",   // Switzerland
    "NED": "NLD",   // Netherlands
    "NL":  "NLD",
    "NZ":  "NZL",
  
    // historical ones – map to modern
    "GDR": "DEU",   // East Germany → Germany
    "FRG": "DEU",   // West Germany → Germany
    "URS": "RUS",   // Soviet Union → Russia
    "ROC": "RUS",   // Russian Olympic Committee → Russia
    "SUN": "RUS",
    "TCH": "CZE",   // Czechoslovakia → Czechia
    "ANZ": "AUS"    // Australasia → Australia (approx)
  };
  
  p.preload = () => {
    worldMap = p.loadJSON("data/custom.geo.json");
    dataTable = p.loadTable("data/country_map.csv", "csv", "header");
  };

  p.setup = () => {
    p.createCanvas(850, 450); 

    extractYears();
    createYearSlider();

    currentYear = years[0];
    updateYearCounts(currentYear);
    p.mousePressed = handleClick;

    p.noLoop();
    
  };

  p.draw = () => {
    p.background(25);

    p.textAlign(p.LEFT, p.BASELINE);

    // Title
    p.fill(255);
    p.textSize(18);
    p.text("Women Swimmer Participation by Country (" + currentYear + ")", 20, 40);
  
    // Draw map
    worldMap.features.forEach((feature) => drawCountry(feature));

    drawSliderLabels();   
    drawLegend();
    drawTooltip();

  };

  function drawSliderLabels() {
    if (years.length === 0) return;
  
    p.textSize(12);
    p.fill(200);
    p.textAlign(p.CENTER, p.TOP);
  
    // choose a horizontal range that roughly matches the slider
    let startX = 20;
    let endX = p.width - 20;
    let labelY = p.height - 10;  // near bottom of canvas
  
    // label the first and last year and maybe a few in between
    for (let i = 0; i < years.length; i++) {
      // only show some labels so it does not get too crowded
      if (i === 0 || i === years.length - 1 || i % 6 === 0) {
        let x = p.map(i, 0, years.length - 1, startX, endX);
        p.text(years[i], x, labelY);
      }
    }
  }

  // Recalculate country counts based on selected year
  function updateYearCounts(selectedYear) {
    countryCounts = {};
    cumulativeCounts = {};
  
    for (let r = 0; r < dataTable.getRowCount(); r++) {
      let rowYear = parseInt(dataTable.getString(r, "Year"));
      if (isNaN(rowYear) || rowYear > selectedYear) continue;
  
      let noc = dataTable.getString(r, "Team_x");
      if (!noc || noc === "NaN") continue;
  
      let iso = nocToIso[noc] || noc;
  
      if (!cumulativeCounts[iso]) cumulativeCounts[iso] = new Set();
      cumulativeCounts[iso].add(rowYear);
    }
  
    // now convert sets to numeric counts
    for (let iso in cumulativeCounts) {
      countryCounts[iso] = cumulativeCounts[iso].size;
    }

    maxYearsParticipated = Math.max(...Object.values(countryCounts), 1);

  }

  function extractYears() {
    let yearSet = new Set();
  
    for (let r = 0; r < dataTable.getRowCount(); r++) {
      let yr = parseInt(dataTable.getString(r, "Year"));
  
      if (!isNaN(yr) && yr <= 2016) {
        yearSet.add(yr);
      }
    }
  
    years = Array.from(yearSet).sort((a, b) => a - b);
  
    years.sort((a, b) => a - b);
  }

  // Create slider
  function createYearSlider() {
    slider = p.createSlider(0, years.length - 1, 0, 1);
  
    slider.parent("viz_worldmap");
  
    slider.style("position", "relative");
    slider.style("margin-top", "10px");
    slider.style("width", p.width + "px");  
  
    slider.input(() => {
      let index = slider.value();
      currentYear = years[index];
      updateYearCounts(currentYear);
      p.redraw();
    });
  }

  function getLongevityColor(c) {
    let maxYears = maxYearsParticipated;
  
    // normalized 0 to 1
    let t = p.constrain(c / maxYears, 0, 1);
  
    // color ramp from dark gold to bright yellow
    let r = p.lerp(82, 252, t);
    let g = p.lerp(50, 177, t);
    let b = p.lerp(8, 49, t);
  
    return p.color(r, g, b);
  }

  // Draw each country
  function drawCountry(feature) {
    let geom = feature.geometry;
  
    // use 3-letter ISO country code from GeoJSON
    let iso = feature.properties.iso_a3;
    let count = countryCounts[iso] || 0;
    let fillCol = count === 0 ? p.color(70) : getLongevityColor(count);
    
    let isSelected = selectedCountry === iso;

    if (isSelected) {
      fillCol = p.color(255, 255, 120); // highlight color
    }

    p.fill(fillCol);
  
    p.stroke(40);
    p.strokeWeight(0.3);
  
    if (geom.type === "Polygon") {
      drawPolygon(geom.coordinates);
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach(poly => drawPolygon(poly));
    }
  }

  function handleClick() {
    let mx = p.mouseX;
    let my = p.mouseY;
  
    selectedCountry = null;
  
    // loop through countries to see which one was clicked
    for (let feature of worldMap.features) {
      if (pointInCountry(feature.geometry, mx, my)) {
        selectedCountry = feature.properties.iso_a3;
        break;
      }
    }
  
    p.redraw();
  }
  

  function drawTooltip() {
    if (!selectedCountry) return;
  
    let iso = selectedCountry;
    let count = countryCounts[iso] || 0;
  
    let yearsList = cumulativeCounts[iso]
      ? [...cumulativeCounts[iso]].sort((a, b) => a - b)
      : [];
  
    let firstYear = yearsList[0] || "None";
    let lastYear = yearsList[yearsList.length - 1] || "None";
  
    let countryName = iso; // replace with actual lookup table if you have one
  
    let lines = [
      countryName,
      "Years participated: " + count,
      "First year: " + firstYear,
      "Most recent: " + lastYear
    ];
  
    p.textSize(12);
    let w = 0;
    lines.forEach(l => (w = Math.max(w, p.textWidth(l))));
    let h = lines.length * 16 + 8;
  
    // Position tooltip near cursor but ensure it stays on canvas
    let bx = Math.min(p.mouseX + 10, p.width - w - 20);
    let by = Math.min(p.mouseY + 10, p.height - h - 20);
  
    p.fill(30, 30, 30, 230);
    p.noStroke();
    p.rect(bx, by, w + 12, h, 4);
  
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
  
    for (let i = 0; i < lines.length; i++) {
      p.text(lines[i], bx + 6, by + 4 + i * 16);
    }
  }

  // Draw polygon
  function drawPolygon(poly) {
    p.beginShape();
    poly[0].forEach((pt) => {
      let lon = pt[0];
      let lat = pt[1];
      let pos = project(lon, lat);
      p.vertex(pos.x, pos.y);
    });
    p.endShape(p.CLOSE);
  }

  // Geo projection
  function project(lon, lat) {
    let x = p.map(lon, -180, 180, 0, p.width);
    let y = p.map(lat, 90, -90, 0, p.height - 20) + 40; 
    return p.createVector(x, y);
  }

  function pointInCountry(geom, mx, my) {
    function pointInPolygon(poly) {
      let pts = poly[0];
      let inside = false;
  
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        let lon1 = pts[i][0];
        let lat1 = pts[i][1];
        let lon2 = pts[j][0];
        let lat2 = pts[j][1];
  
        let p1 = project(lon1, lat1);
        let p2 = project(lon2, lat2);
  
        let intersect =
          (p1.y > my) !== (p2.y > my) &&
          mx < (p2.x - p1.x) * (my - p1.y) / (p2.y - p1.y + 0.00001) + p1.x;
  
        if (intersect) inside = !inside;
      }
  
      return inside;
    }
  
    if (!geom) return false;
  
    if (geom.type === "Polygon") {
      return pointInPolygon(geom.coordinates);
    } else if (geom.type === "MultiPolygon") {
      for (let poly of geom.coordinates) {
        if (pointInPolygon(poly)) return true;
      }
      return false;
    }
  
    return false;
  }

  function drawLegend() {
    let x = 20;
    let y = p.height - 80;
    let w = 200;
    let h = 15;
  
    p.fill(255);
    p.textSize(12);
    p.text("Longevity (Years Participated)", x + 80, y - 20);
  
    let steps = maxYearsParticipated;  
    let blockWidth = w / (steps + 1);
  
    // Draw each discrete block
    for (let i = 0; i <= steps; i++) {
      let col;
  
      if (i === 0) {
        col = p.color(70);
      } else {
        col = getLongevityColor(i);
      }
  
      p.fill(col);
      p.stroke(col);
      let blockX = x + i * blockWidth;
      p.rect(blockX, y, blockWidth, h);
    }
  
    // Outline
    p.noFill();
    p.stroke(200);
    p.rect(x, y, w, h);
  
    // Labels
    p.fill(230);
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);
    p.text("0", x, y + h + 3);
  
    p.textAlign(p.RIGHT, p.TOP);
    p.text(maxYearsParticipated, x + w, y + h + 3);
  }
  
};

new p5(worldMapSketch, "viz_worldmap");