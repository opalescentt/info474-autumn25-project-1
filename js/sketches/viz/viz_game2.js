(function () {
  var manager = {
    margin: { top: 40, right: 40, bottom: 80, left: 80 },
    data: null,
    currentView: 0
  };

  var views = [
    { 
      x: 'Age', y: 'Results', 
      xLabel: 'Age (years)', yLabel: 'Results (seconds)', 
      title: 'Age vs Results',
      observation: 'Results range from 51 to 63 seconds across all ages, with no obvious pattern showing older or younger swimmers perform better.'
    },
    { 
      x: 'Height', y: 'Results', 
      xLabel: 'Height (cm)', yLabel: 'Results (seconds)', 
      title: 'Height vs Results',
      observation: 'Performance varies widely across all heights (165-186cm), with both fast and slow times appearing throughout the range. Height alone doesn\'t determine success.'
    },
    { 
      x: 'Weight', y: 'Results', 
      xLabel: 'Weight (kg)', yLabel: 'Results (seconds)', 
      title: 'Weight vs Results',
      observation: 'Performance varies widely across all weight ranges, with no clear pattern linking weight to faster or slower times.'
    },
    { 
      x: 'Height', y: 'Weight', 
      xLabel: 'Height (cm)', yLabel: 'Weight (kg)', 
      title: 'Height vs Weight',
      observation: 'There is a moderate positive correlation between height and weight among Olympic swimmers; taller athletes tend to weigh more.'
    },
    { 
      x: 'Age', y: 'Height', 
      xLabel: 'Age (years)', yLabel: 'Height (cm)', 
      title: 'Age vs Height',
      observation: ''
    },
    { 
      x: 'Age', y: 'Weight', 
      xLabel: 'Age (years)', yLabel: 'Weight (kg)', 
      title: 'Age vs Weight',
      observation: ''
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
      var canvas = p.createCanvas(850, 350);
      canvas.parent('viz_game2');
      p.textFont('Inria Serif');
    };

    p.draw = function () {
      if (!manager.data || manager.data.length === 0) {
        p.background(255);
        p.fill(0);
        p.textSize(18);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Loading data...', p.width / 2, p.height / 2);
        return;
      }

      p.background(255);

      var view = views[manager.currentView];
      var plotWidth = p.width - manager.margin.left - manager.margin.right;
      var plotHeight = p.height - manager.margin.top - manager.margin.bottom - 40; // Extra space for observation

      var xData = manager.data.map(d => d[view.x]);
      var yData = manager.data.map(d => d[view.y]);
      var xMin = Math.min(...xData);
      var xMax = Math.max(...xData);
      var yMin = Math.min(...yData);
      var yMax = Math.max(...yData);

      var xPadding = (xMax - xMin) * 0.1;
      var yPadding = (yMax - yMin) * 0.1;

      p.fill(0);
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Does age, height, and weight give athletes performance advantages?', p.width / 2, 25);

      p.push();
      p.translate(manager.margin.left, manager.margin.top);

      p.stroke(0);
      p.strokeWeight(2);
      p.line(0, plotHeight, plotWidth, plotHeight);
      p.line(0, 0, 0, plotHeight);

      p.stroke(200);
      p.strokeWeight(1);
      for (let i = 0; i <= 5; i++) {
        var x = (i / 5) * plotWidth;
        var y = (i / 5) * plotHeight;
        p.line(x, 0, x, plotHeight);
        p.line(0, y, plotWidth, y);
      }

      p.fill(0);
      p.noStroke();
      p.textSize(14);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(view.xLabel, plotWidth / 2, plotHeight + 30);

      p.push();
      p.translate(-50, plotHeight / 2);
      p.rotate(-p.HALF_PI);
      p.text(view.yLabel, 0, 0);
      p.pop();

      p.textSize(12);
      for (let i = 0; i <= 5; i++) {
        var xVal = xMin - xPadding + (i / 5) * (xMax - xMin + 2 * xPadding);
        var yVal = yMin - yPadding + (i / 5) * (yMax - yMin + 2 * yPadding);
        var x = (i / 5) * plotWidth;
        var y = (i / 5) * plotHeight;

        p.textAlign(p.CENTER, p.TOP);
        p.text(xVal.toFixed(1), x, plotHeight + 10);

        p.textAlign(p.RIGHT, p.CENTER);
        p.text(yVal.toFixed(1), -10, plotHeight - y);
      }

      var mapX = function(val) { return p.map(val, xMin - xPadding, xMax + xPadding, 0, plotWidth); };
      var mapY = function(val) { return p.map(val, yMin - yPadding, yMax + yPadding, plotHeight, 0); };

      hoveredPoint = null;
      var mouseXRel = p.mouseX - manager.margin.left;
      var mouseYRel = p.mouseY - manager.margin.top;

      manager.data.forEach(function(d) {
        var x = mapX(d[view.x]);
        var y = mapY(d[view.y]);
        var dist = p.dist(x, y, mouseXRel, mouseYRel);

        if (dist < 8) {
          hoveredPoint = { data: d, view: view };
        }

        p.noStroke();
        if (dist < 8) {
          p.fill(255, 100, 100);
          p.circle(x, y, 12);
        } else {
          // p.fill(100, 150, 255, 180);
          p.fill(255, 204, 25);
          p.stroke(0);
          p.circle(x, y, 8);
        }
      });

      p.pop();

      p.fill(60);
      p.noStroke();
      p.textSize(13);
      p.textAlign(p.CENTER, p.TOP);
      var observationY = manager.margin.top + plotHeight + 50;
      
      var maxWidth = plotWidth;
      var words = view.observation.split(' ');
      var line = '';
      var lineHeight = 18;
      var y = observationY;
      
      for (var i = 0; i < words.length; i++) {
        var testLine = line + words[i] + ' ';
        var testWidth = p.textWidth(testLine);
        
        if (testWidth > maxWidth && i > 0) {
          p.text(line, p.width / 2, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      p.text(line, p.width / 2, y);

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
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
        p.text(hoveredPoint.data.Athlete, tooltipX + 8, tooltipY - 42);
        p.text(hoveredPoint.view.xLabel + ': ' + hoveredPoint.data[hoveredPoint.view.x], tooltipX + 8, tooltipY - 24);
        p.text(hoveredPoint.view.yLabel + ': ' + hoveredPoint.data[hoveredPoint.view.y], tooltipX + 8, tooltipY - 6);
      }
    };
  });

  document.getElementById('viewSelect').addEventListener('change', function(e) {
    manager.currentView = parseInt(e.target.value);
  });
})();