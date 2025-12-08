// Visualization 3 for top 10
(function () {
  var manager = {
    margin: { top: 40, right: 40, bottom: 40, left: 80 },
    offsetX: 80,
    offsetY: 40,
    currentStroke: 0,
  };

  var strokeTypes = [
    { name: "Freestyle", dataKey: "freestyleData" },
    { name: "Backstroke", dataKey: "backstrokeData" },
    { name: "Breaststroke", dataKey: "breaststrokeData" },
    { name: "Butterfly", dataKey: "butterflyData" },
  ];

  let freestyleData, backstrokeData, breaststrokeData, butterflyData;
  let nameArr, yearArr, countryArr, ageArr, heightArr, weightArr, timeArr;

  new p5(function (p) {
    p.preload = function () {
      freestyleData = p.loadTable("data/freestyle_data.csv", "csv", "header");
      backstrokeData = p.loadTable("data/backstroke_data.csv", "csv", "header");
      breaststrokeData = p.loadTable(
        "data/breaststroke_data.csv",
        "csv",
        "header"
      );
      butterflyData = p.loadTable("data/butterfly_data.csv", "csv", "header");
    };

    p.setup = function () {
      var canvas = p.createCanvas(770, 440);
      canvas.parent("viz_top10");
      p.textFont("Inria Serif");
    };

    p.draw = function () {
      p.clear();
      p.background(0);
      drawTable(p);
    };

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
        "Time (s)",
      ];

      // select stroke
      let selectedData;
      switch (manager.currentStroke) {
        case 0:
          selectedData = freestyleData;
          break;
        case 1:
          selectedData = backstrokeData;
          break;
        case 2:
          selectedData = breaststrokeData;
          break;
        case 3:
          selectedData = butterflyData;
          break;
        default:
          selectedData = freestyleData;
      }

      nameArr = selectedData.getColumn("Athlete");
      yearArr = selectedData.getColumn("Year");
      countryArr = selectedData.getColumn("Team");
      ageArr = selectedData.getColumn("Age");
      heightArr = selectedData.getColumn("Height");
      weightArr = selectedData.getColumn("Weight");
      timeArr = selectedData.getColumn("Results");

      let arrNames = [
        nameArr,
        yearArr,
        countryArr,
        ageArr,
        heightArr,
        weightArr,
        timeArr,
      ];

      let x_cell = 0;
      let x_width = 90;
      let name_adjustment = 0;

      // first loop for columns
      for (let i = 0; i < 7; i++) {
        let y_cell = 0;
        let selectedArr = arrNames[i];

        if (i == 0) {
          x_width = 230;
          name_adjustment = 67;
        }
        // second loop - fills in cells vertically
        for (let j = -1; j < 11; j++) {
          if (j == -1) {
            p.push();
            p.fill("#252525");
            p.stroke("#EFEFEF");
            p.rect(x_cell, y_cell, x_width, 40);
            p.pop();

            p.push();
            p.fill("white");
            p.textSize(16);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(rowNames[i], x_cell + 45 + name_adjustment, 22);
            p.pop();
            y_cell += 40;
          } else {
            p.push();
            p.fill("white");
            p.stroke("#EFEFEF");
            p.rect(x_cell, y_cell, x_width, 40);
            p.pop();

            p.push();
            p.fill("black");
            p.textSize(16);
            p.textAlign(p.CENTER, p.CENTER);
            p.textStyle(i === 6 ? p.BOLD : p.NORMAL);
            p.text(selectedArr[j], x_cell + 45 + name_adjustment, y_cell + 25);
            p.pop();
            y_cell += 40;
          }
        }
        x_cell += x_width;
        x_width = 90;
        name_adjustment = 0;
      }

      p.pop();
    }
  });

  document
    .getElementById("strokeSelect")
    .addEventListener("change", function (e) {
      manager.currentStroke = parseInt(e.target.value);
    });
})();
