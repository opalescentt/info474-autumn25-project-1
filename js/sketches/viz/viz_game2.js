(function () {
  var manager = {
    margin: { top: 100, right: 3, bottom: 65, left: 45 },
    data: null
  };

  var views = [
    { 
      x: 'Age', y: 'Results', 
      xLabel: 'Age (years)', yLabel: 'Results (sec)', 
      title: 'Age vs Results',
    },
    { 
      x: 'Height', y: 'Results', 
      xLabel: 'Height (cm)', yLabel: '', 
      title: 'Height vs Results',
    },
    { 
      x: 'Weight', y: 'Results', 
      xLabel: 'Weight (kg)', yLabel: '', 
      title: 'Weight vs Results',
    }
  ];

  let hoveredPoint = null;

  new p5(function (p) {
    p.preload = function () {
      p.loadTable('data/cleaned_freestyle_100.csv', 'csv', 'header', function(table) {
        manager.data = [];
        for (let i = 0; i < table.getRowCount(); i++) {
          manager.data.push({
            Athlete: table.getString(i, 'Athlete'),
            Age: table.getNum(i, 'Age'),
            Height: table.getNum(i, 'Height'),
            Weight: table.getNum(i, 'Weight'),
            Results: table.getNum(i, 'Results')
          });
        }
      });
    };

    p.setup = function () {
      var canvas = p.createCanvas(850, 400);
      canvas.parent('viz_game2');
      p.textFont('Inria Serif');
    };

    p.draw = function () {
      p.background(0, 127);
      
      // Draw static text first (before checking hover states)
      p.fill(255, 204, 0);
      p.textSize(20);
      p.noStroke();
      p.textAlign(p.LEFT, p.BASELINE);
      p.text("Hover over each dot to see athlete's details.", 50, 40);

      p.fill(255, 220);
      p.textSize(12);
      p.textAlign(p.LEFT, p.BASELINE);
      p.text("Y-axis is scaled to the minimum and maximum race times, based on available women's 100m freestyle Olympic results from 1912–2020.", 55, 65);

      var plotWidth = (p.width - 60) / 3 - manager.margin.left - manager.margin.right;
      var plotHeight = p.height - manager.margin.top - manager.margin.bottom;

      hoveredPoint = null;

      // Draw three plots side by side
      for (let plotIndex = 0; plotIndex < 3; plotIndex++) {
        var view = views[plotIndex];
        var xOffset = plotIndex * ((p.width - 60) / 3) + 30;

        var xData = manager.data.map(d => d[view.x]);
        var yData = manager.data.map(d => d[view.y]);
        var xMin = Math.min(...xData);
        var xMax = Math.max(...xData);
        var yMin = Math.min(...yData);
        var yMax = Math.max(...yData);

        var xPadding = (xMax - xMin) * 0.1;
        var yPadding = (yMax - yMin) * 0.1;

        p.push();
        p.translate(xOffset + manager.margin.left, manager.margin.top);

        // Title
        // p.fill(0);
        // p.textSize(14);
        // p.fill(255, 220);
        // p.textAlign(p.CENTER, p.CENTER);
        // p.text(view.title, plotWidth / 2, -15);

        // Axes
        p.stroke(0);
        p.strokeWeight(2);
        p.line(0, plotHeight, plotWidth, plotHeight);
        p.line(0, 0, 0, plotHeight);

        // Grid
        p.stroke(80);
        p.strokeWeight(1);
        for (let i = 0; i <= 5; i++) {
          var x = (i / 5) * plotWidth;
          var y = (i / 5) * plotHeight;
          p.line(x, 0, x, plotHeight);
          p.line(0, y, plotWidth, y);
        }

        // Axis labels
        p.fill(0);
        p.noStroke();
        p.textSize(11);
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(255, 220);
        p.text(view.xLabel, plotWidth / 2, plotHeight + 25);

        // Only show y-axis label on the first plot
        if (plotIndex === 0) {
          p.push();
          p.translate(-40, plotHeight / 2);
          p.rotate(-p.HALF_PI);
          p.fill(255, 220);
          p.text(view.yLabel, 0, 0);
          p.pop();
        }

        // Tick labels
        p.textSize(9);
        for (let i = 0; i <= 5; i++) {
          var xVal = xMin - xPadding + (i / 5) * (xMax - xMin + 2 * xPadding);
          var yVal = yMin - yPadding + (i / 5) * (yMax - yMin + 2 * yPadding);
          var x = (i / 5) * plotWidth;
          var y = (i / 5) * plotHeight;

          p.textAlign(p.CENTER, p.TOP);
          p.fill(255, 220);
          p.text(xVal.toFixed(1), x, plotHeight + 5);

          // Only show y-axis tick labels on the first (leftmost) plot
          if (plotIndex === 0) {
            p.textAlign(p.RIGHT, p.CENTER);
            p.fill(255, 220);
            p.text(yVal.toFixed(1), -5, plotHeight - y);
          }
        }

        var mapX = function(val) { return p.map(val, xMin - xPadding, xMax + xPadding, 0, plotWidth); };
        var mapY = function(val) { return p.map(val, yMin - yPadding, yMax + yPadding, plotHeight, 0); };

        var mouseXRel = p.mouseX - xOffset - manager.margin.left;
        var mouseYRel = p.mouseY - manager.margin.top;

        // Draw points
        manager.data.forEach(function(d) {
          var x = mapX(d[view.x]);
          var y = mapY(d[view.y]);
          var dist = p.dist(x, y, mouseXRel, mouseYRel);

          if (dist < 8 && mouseXRel >= 0 && mouseXRel <= plotWidth && mouseYRel >= 0 && mouseYRel <= plotHeight) {
            hoveredPoint = { data: d, view: view };
          }

          p.noStroke();
          if (dist < 8 && mouseXRel >= 0 && mouseXRel <= plotWidth && mouseYRel >= 0 && mouseYRel <= plotHeight) {
            p.fill(255, 100, 100);
            p.circle(x, y, 12);
          } else {
            p.fill(255, 204, 25);
            p.stroke(0);
            p.circle(x, y, 7);
          }
        });

        p.pop();
      }

      // Tooltip
      if (hoveredPoint) {
        var tooltipX = p.mouseX + 15;
        var tooltipY = p.mouseY - 20;

        if (tooltipX + 150 > p.width) tooltipX = p.mouseX - 165;
        if (tooltipY - 50 < 0) tooltipY = p.mouseY + 20;

        p.fill(255, 255, 255, 240);
        p.stroke(0);
        p.strokeWeight(1);
        p.rect(tooltipX, tooltipY - 50, 150, 60, 5);

        p.fill(0);
        p.noStroke();
        p.textSize(11);
        p.textAlign(p.LEFT, p.TOP);
        p.text(hoveredPoint.data.Athlete, tooltipX + 8, tooltipY - 42);
        p.text(hoveredPoint.view.xLabel + ': ' + hoveredPoint.data[hoveredPoint.view.x], tooltipX + 8, tooltipY - 24);
        p.text(hoveredPoint.view.yLabel + ': ' + hoveredPoint.data[hoveredPoint.view.y], tooltipX + 8, tooltipY - 6);
      }
    };
  });
})();