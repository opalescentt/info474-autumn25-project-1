// Visualization 3 for top 10
(function () {
  var manager = {
    margin: { top: 40, right: 40, bottom: 40, left: 80 },
    offsetX: 80,
    offsetY: 40,
  };

  let data;
  let nameArr, yearArr, countryArr, ageArr, heightArr, weightArr, timeArr;

  new p5(function (p) {
    p.preload = function () {
      freestyleData = p.loadTable(
        "data/placeholder_table_viz_data.csv",
        "csv",
        "header"
      );
      backstrokeData = p.loadTable(
        "data/placeholder_table_viz_data.csv",
        "csv",
        "header"
      );
      breastrokeData = p.loadTable(
        "data/placeholder_table_viz_data.csv",
        "csv",
        "header"
      );
      butterflyData = p.loadTable(
        "data/placeholder_table_viz_data.csv",
        "csv",
        "header"
      );
    };

    p.setup = function () {
      var canvas = p.createCanvas(1200, 400);
      canvas.parent("viz_top10");
      p.textFont("Inria Serif");
    };

    p.draw = function () {
      // rows:
      // Name, Year, Country, Age, Weight, Height, Speed
      // canvas is 900 wide and 400 long
      // each cell is 128px wide and px long
      p.clear();
      p.background(0);

      dataSelect();
      drawTable(p);
    };

    function dataSelect() {
      let sportsArr = ["Freestyle", "Breaststroke", "Backstroke", "Butterfly"];

      let x_cell = 0;
      let y_cell = 0;

      for (i = 0; i < 4; i++) {
        p.push();
        p.fill("#3D3D3D");
        p.stroke("#EFEFEF");
        p.rect(x_cell, y_cell, 200, 50);
        p.pop();

        p.push();
        p.stroke("#D9D9D9");
        p.fill("white");
        p.textSize(20);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(sportsArr[i], x_cell + 100, y_cell + 30);
        y_cell += 50;
        p.pop();
      }
    }

    function drawTable(p) {
      p.push();
      p.stroke(255);
      p.noFill();

      let rowNames = [
        "Name",
        "Year",
        "Country",
        "Age",
        "Height",
        "Weight",
        "Time",
      ];

      nameArr = data.getColumn("Athlete");
      yearArr = data.getColumn("Year");
      countryArr = data.getColumn("Team");
      ageArr = data.getColumn("Age");
      heightArr = data.getColumn("Height");
      weightArr = data.getColumn("Weight");
      timeArr = data.getColumn("Results");

      let arrNames = [
        nameArr,
        yearArr,
        countryArr,
        ageArr,
        heightArr,
        weightArr,
        timeArr,
      ];

      let x_cell = 200;
      let x_width = 128;
      let name_adjustment = 0;

      // first loop for columns
      for (i = 0; i < 7; i++) {
        let y_cell = 0;
        let selectedArr = arrNames[i];

        if (i == 0) {
          x_width = 230;
          name_adjustment = 50;
        }
        // second loop - fills in cells vertically
        for (j = 0; j < 10; j++) {
          if (j == 0) {
            p.push();
            p.fill("#252525");
            p.stroke("#EFEFEF");
            p.rect(x_cell, y_cell, x_width, 50);
            p.pop();

            p.push();
            p.fill("white");
            p.textSize(20);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(rowNames[i], x_cell + 65 + name_adjustment, 30);
            p.pop();
            y_cell += 50;
          } else {
            p.push();
            p.fill("white");
            p.stroke("#EFEFEF");
            p.rect(x_cell, y_cell, x_width, 50);
            p.pop();

            p.push();
            p.fill("black");
            p.textSize(20);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(selectedArr[j], x_cell + 65 + name_adjustment, y_cell + 25);
            p.pop();
            y_cell += 50;
          }
        }
        x_cell += x_width;
        x_width = 128;
        name_adjustment = 0;
      }

      p.pop();
    }
  });
})();
