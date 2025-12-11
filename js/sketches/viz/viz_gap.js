// Visualization 1 for gender performance gap
(function () {
  var manager = {
    margin: { top: 40, right: 40, bottom: 40, left: 80 },
    offsetX: 80,
    offsetY: 40,
    data: null,
  };

  let men_data, women_data, menYearArr, menTimeArr, womenYearArr, womenTimeArr;
  let pix_per_sec = 15;
  let segments = [];

  new p5(function (p) {
    p.preload = function () {
      men_data = p.loadTable("data/gap_viz_data_men.csv", "csv", "header");
      women_data = p.loadTable("data/gap_viz_data_women.csv", "csv", "header");
    };

    p.setup = function () {
      menYearArr = men_data.getColumn("Year");
      menTimeArr = men_data.getColumn("Results").map(function (val) {
        return Number(val);
      });
      womenYearArr = women_data.getColumn("Year");
      womenTimeArr = women_data.getColumn("Results").map(function (val) {
        return Number(val);
      });

      var canvas = p.createCanvas(850, 400);
      canvas.parent("viz_gap");
      p.textFont("Inria Serif");
    };

    p.draw = function () {
      // background color
      p.push();
      p.clear();
      p.background("#111111");
      p.pop();

      segments = [];

      // axes
      p.push();
      p.fill(255);
      p.stroke(255);
      p.line(100, 50, 760, 50);
      p.line(100, 50, 100, 350);

      // text
      p.textSize(20);
      p.text("Year", 60, 380);
      p.text("Time (s)", 760, 40);
      p.text("40", 90, 40);

      let x_axis_label = 40;
      // axis ticks
      for (let i = 1; i < 45; i++) {
        if (i % 5 == 0) {
          x_axis_label += 5;
          p.line(100 + i * pix_per_sec, 45, 100 + i * pix_per_sec, 55);
          p.text(x_axis_label, 100 + i * pix_per_sec - 9, 38);
        } else {
          p.line(100 + i * pix_per_sec, 48, 100 + i * pix_per_sec, 52);
        }
      }

      p.pop();

      plotData();
      drawTooltip();
    };

    function plotData() {
      let year_px = 100;
      const time_px_baseline = 100;
      for (let i = 0; i < menYearArr.length; i++) {
        // year labels
        p.push();
        p.fill("white");
        p.textSize(20);
        p.text(menYearArr[i], 50, year_px);
        p.pop();

        // data plotting

        let men_time_loc =
          time_px_baseline + pix_per_sec * (menTimeArr[i] - 40);
        let women_time_loc =
          time_px_baseline + pix_per_sec * (womenTimeArr[i] - 40);

        if (i === 0) {
          p.push();
          p.fill(255);
          p.textSize(16);
          p.fill("#0281C8");
          p.text("M", men_time_loc - 7, year_px - 18);
          p.fill("#FCB131");
          p.text("F", women_time_loc - 3, year_px - 18);
          p.pop();
        }

        p.push();
        p.stroke(255);
        p.line(men_time_loc, year_px - 7, women_time_loc, year_px - 7);
        p.pop();

        p.push();
        p.fill("#0281C8");
        p.ellipse(men_time_loc, year_px - 7, 10, 10);
        p.textSize(16);
        p.text(menTimeArr[i].toFixed(2) + "s", men_time_loc - 20, year_px + 14);
        p.pop();

        p.push();
        p.fill("#FCB131");
        p.ellipse(women_time_loc, year_px - 7, 10, 10);
        p.textSize(16);
        p.text(
          womenTimeArr[i].toFixed(2) + "s",
          women_time_loc - 20,
          year_px + 14
        );
        p.pop();

        segments.push({
          year: menYearArr[i],
          menTime: menTimeArr[i],
          womenTime: womenTimeArr[i],
          gap: womenTimeArr[i] - menTimeArr[i],
          y: year_px - 7,
          menX: men_time_loc,
          womenX: women_time_loc,
          x1: Math.min(men_time_loc, women_time_loc),
          x2: Math.max(men_time_loc, women_time_loc),
        });

        // set up for next loop
        year_px += 40;
      }
    }
    function drawTooltip() {
      if (!segments.length) return;
      const mx = p.mouseX;
      const my = p.mouseY;
      let hoverSegment = null;

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const withinX = mx >= seg.x1 - 8 && mx <= seg.x2 + 8;
        const withinY = Math.abs(my - seg.y) <= 12;
        if (withinX && withinY) {
          hoverSegment = seg;
          break;
        }
      }

      if (!hoverSegment) return;

      p.push();
      p.stroke("#C80428");
      p.strokeWeight(4);
      p.line(hoverSegment.x1, hoverSegment.y, hoverSegment.x2, hoverSegment.y);

      p.noStroke();
      p.fill("#0281C8");
      p.circle(hoverSegment.menX, hoverSegment.y, 14);
      p.fill("#FCB131");
      p.circle(hoverSegment.womenX, hoverSegment.y, 14);
      p.pop();

      const tooltipLines = [
        `${hoverSegment.year} Games`,
        `Gap: ${hoverSegment.gap.toFixed(2)}s`,
      ];

      p.push();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      let boxWidth = 0;
      tooltipLines.forEach(function (line) {
        boxWidth = Math.max(boxWidth, p.textWidth(line));
      });
      const padding = 8;
      const lineHeight = 16;
      const boxHeight = lineHeight * tooltipLines.length + padding * 2;
      let boxX = mx + 16;
      let boxY = my - boxHeight - 16;

      if (boxX + boxWidth + padding * 2 > p.width) {
        boxX = p.width - boxWidth - padding * 2 - 10;
      }
      if (boxY < 10) {
        boxY = my + 16;
      }

      p.fill(255, 255, 255, 240);
      p.stroke(0);
      p.strokeWeight(1);
      p.rect(boxX, boxY, boxWidth + padding * 2, boxHeight, 5);

      p.fill(0);
      p.noStroke();
      for (let i = 0; i < tooltipLines.length; i++) {
        p.text(
          tooltipLines[i],
          boxX + padding,
          boxY + padding + i * lineHeight
        );
      }
      p.pop();
    }
    // 1912, 1932, 1952, 1972, 1992, 2012
    // 1916, 1944 olympics canclled bc of ww1
  });
})();
