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
      updateYearCounts(currentYear);
  
      p.noLoop();
    };
  
  };
  
  new p5(worldMapSketch, "viz_worldmap");