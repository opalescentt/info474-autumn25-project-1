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
  let nameArr,
    yearArr,
    teamArr,
    countryArr,
    ageArr,
    heightArr,
    weightArr,
    timeArr;

  let logosArr = {};
  let logoCells = [];

  const team_logo_codes = [
    "AUS",
    "BUL",
    "CAN",
    "EUN",
    "FRA",
    "GDR",
    "GER",
    "HUN",
    "LTU",
    "NED",
    "ROU",
    "RSA",
    "USA",
    "JPN",
    "CHN",
  ];

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

      team_logo_codes.forEach(function (logo) {
        logosArr[logo] = p.loadImage("assets/" + logo + ".png");
      });
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
      drawLogoTooltip(p);
    };

    function drawTable(p) {
      p.push();
      p.stroke(255);
      p.noFill();
      logoCells = [];

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
      teamArr = selectedData.getColumn("Team");
      countryArr = selectedData.getColumn("Country");
      ageArr = selectedData.getColumn("Age");
      heightArr = selectedData.getColumn("Height");
      weightArr = selectedData.getColumn("Weight");
      timeArr = selectedData.getColumn("Results");

      let arrNames = [
        nameArr,
        yearArr,
        teamArr,
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
            p.fill("#C80428");
            p.noStroke();
            p.rect(x_cell, y_cell, x_width, 40);
            p.pop();

            p.push();
            p.fill("white");
            p.textSize(14);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(rowNames[i], x_cell + 45 + name_adjustment, 22);
            p.pop();
            y_cell += 40;
          } else {
            const rowColor = j % 2 === 0 ? "#1f1f1f" : "#121212";
            p.push();
            p.fill(rowColor);
            p.noStroke();
            p.rect(x_cell, y_cell, x_width, 40);
            p.pop();

            if (i === 2) {
              const teamCode = teamArr[j];
              const logoImg = teamCode ? logosArr[teamCode] : null;

              if (logoImg) {
                p.push();
                p.image(logoImg, x_cell + 24 + name_adjustment, y_cell - 3);
                p.pop();
                logoCells.push({
                  x: x_cell,
                  y: y_cell,
                  w: x_width,
                  h: 40,
                  label: countryArr[j] || "",
                });
              } else {
                p.push();
                p.fill("white");
                p.noStroke();
                p.textSize(14);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(
                  teamCode || "-",
                  x_cell + 45 + name_adjustment,
                  y_cell + 25
                );
                p.pop();
              }
            } else {
              p.push();
              p.fill("white");
              p.noStroke();
              p.textSize(14);
              p.textAlign(p.CENTER, p.CENTER);
              p.textStyle(i === 6 ? p.BOLD : p.NORMAL);
              p.text(
                selectedArr[j],
                x_cell + 45 + name_adjustment,
                y_cell + 25
              );
              p.pop();
            }
            y_cell += 40;
          }
        }
        x_cell += x_width;
        x_width = 90;
        name_adjustment = 0;
      }

      p.pop();
    }

    function drawLogoTooltip(p) {
      if (!logoCells.length) return;
      const mx = p.mouseX;
      const my = p.mouseY;
      let hovered = null;

      for (let i = 0; i < logoCells.length; i++) {
        const cell = logoCells[i];
        if (
          mx >= cell.x &&
          mx <= cell.x + cell.w &&
          my >= cell.y &&
          my <= cell.y + cell.h
        ) {
          hovered = cell;
          break;
        }
      }

      if (!hovered || !hovered.label) return;

      const paddingX = 10;
      const paddingY = 6;
      const maxWidth = 220;
      const charLimit = 28;
      const textLines = [];
      let remaining = hovered.label;
      while (remaining.length > charLimit) {
        textLines.push(remaining.slice(0, charLimit));
        remaining = remaining.slice(charLimit);
      }
      if (remaining.length) textLines.push(remaining);

      p.push();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);

      let boxWidth = 0;
      textLines.forEach(function (line) {
        boxWidth = Math.max(boxWidth, p.textWidth(line));
      });
      boxWidth = Math.min(Math.max(boxWidth + paddingX * 2, 90), maxWidth);
      const boxHeight = textLines.length * 16 + paddingY * 2;
      let tooltipX = mx + 15;
      let tooltipY = my - 20;

      if (tooltipX + boxWidth > p.width) tooltipX = mx - boxWidth - 15;
      if (tooltipY - boxHeight < 0) tooltipY = my + 20;

      p.fill(255, 255, 255, 240);
      p.stroke(0);
      p.strokeWeight(1);
      p.rect(tooltipX, tooltipY - boxHeight, boxWidth, boxHeight, 5);

      p.fill(0);
      p.noStroke();
      textLines.forEach(function (line, idx) {
        p.text(
          line,
          tooltipX + paddingX,
          tooltipY - boxHeight + paddingY + idx * 16
        );
      });
      p.pop();
    }
  });
  document
    .getElementById("strokeSelect")
    .addEventListener("change", function (e) {
      manager.currentStroke = parseInt(e.target.value);
    });
})();
