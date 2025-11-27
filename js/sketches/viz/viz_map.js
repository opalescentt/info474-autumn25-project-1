const worldMapSketch = (p) => {

    let worldMap;
    let dataTable;
  
    let countryCounts = {};
    let years = [];
    let slider;
    let currentYear;

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
    //   updateYearCounts(currentYear);
  
      p.noLoop();
    };
  
    p.draw = () => {
      p.background(25);
  
      // Draw map
      worldMap.features.forEach((feature) => drawCountry(feature));
    };

    function extractYears() {
        let yearSet = new Set();
    
        for (let r = 0; r < dataTable.getRowCount(); r++) {
          let yr = dataTable.getString(r, "Year");
          if (yr && yr !== "NaN") yearSet.add(yr);
        }
    
        years = Array.from(yearSet).sort((a, b) => a - b);
    }

    // Create slider
    function createYearSlider() {
        slider = p.createSlider(0, years.length - 1, 0, 1);
      
        slider.parent("viz_worldmap");
      
        slider.style("position", "relative");
        slider.style("margin-top", "10px");
        slider.style("width", "90%");
      
        slider.input(() => {
          let index = slider.value();
          currentYear = years[index];
          updateYearCounts(currentYear);
          p.redraw();
        });
    }
  
    // Draw each country
    function drawCountry(feature) {
        let geom = feature.geometry;
      
        // use 3-letter ISO country code from GeoJSON
        let iso = feature.properties.iso_a3;
      
        let count = countryCounts[iso] || 0;
      
        // simple visible colors: grey if 0, gold if >0
        let fillCol = count === 0
            ? p.color(70)
            : p.color(255, 200, 50);
      
        p.fill(fillCol);
        p.stroke(40);
        p.strokeWeight(0.3);
      
        if (geom.type === "Polygon") {
          drawPolygon(geom.coordinates);
        } else if (geom.type === "MultiPolygon") {
          geom.coordinates.forEach(poly => drawPolygon(poly));
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
      let y = p.map(lat, 90, -90, 0, p.height - 80); // leave space for slider
      return p.createVector(x, y);
    }
  
  };
  
  new p5(worldMapSketch, "viz_worldmap");