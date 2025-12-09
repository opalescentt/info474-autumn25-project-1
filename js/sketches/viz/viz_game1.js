// Viz for game 1 guess winning pattern interaction
(function () {
  var manager = {
    margin: { top: 40, right: 40, bottom: 40, left: 80 },
    offsetX: 135,
    offsetY: 40,
  };

  var actualData = {
    age: { median: 19, q1: 16, q3: 22, range: [14, 29] },
    height: { median: 173, q1: 170, q3: 178, range: [160, 185] },
    weight: { median: 63, q1: 60, q3: 67, range: [49, 76] }
  };

  var showAnswer = false;
  var distribution_data;
  var useImperial = false;

  let circles = [
    { x: 380, y: 50, dragging: false, lineY: 30, label: 'Age', actual: actualData.age, unit: '', metric: 'age' },
    { x: 400, y: 150, dragging: false, lineY: 120, label: 'Height', actual: actualData.height, unit: 'cm', metric: 'height' },
    { x: 300, y: 250, dragging: false, lineY: 210, label: 'Weight', actual: actualData.weight, unit: 'kg', metric: 'weight' }
  ];

  function cmToFeet(cm) {
    var totalInches = cm / 2.54;
    var feet = Math.floor(totalInches / 12);
    var inches = Math.round(totalInches % 12);
    return feet + "'" + inches + '"';
  }

  function kgToLbs(kg) {
    return Math.round(kg * 2.20462);
  }

  function getDisplayValue(circle, value) {
    if (circle.metric === 'height' && useImperial) {
      return cmToFeet(value);
    } else if (circle.metric === 'weight' && useImperial) {
      return kgToLbs(value) + 'lbs';
    } else {
      return value + circle.unit;
    }
  }

  new p5(function (p) {
    p.preload = function () {
      distribution_data = p.loadTable("data/game1_distribution.csv", "csv", "header");
    };

    p.setup = function () {
      var canvas = p.createCanvas(850, 400);
      canvas.parent('viz_game1');
      p.textFont('Inria Serif');
      
      if (distribution_data) {
        loadDistributionData();
      }
    };
    
    function loadDistributionData() {
      for (let i = 0; i < distribution_data.getRowCount(); i++) {
        let metric = distribution_data.getString(i, 'Metric');
        let q1 = Math.round(distribution_data.getNum(i, 'q1_25th'));
        let median = Math.round(distribution_data.getNum(i, 'median_50th'));
        let q3 = Math.round(distribution_data.getNum(i, 'q3_75th'));
        let min = Math.round(distribution_data.getNum(i, 'min'));
        let max = Math.round(distribution_data.getNum(i, 'max'));
        
        if (metric === 'Age') {
          actualData.age.q1 = q1;
          actualData.age.median = median;
          actualData.age.q3 = q3;
          actualData.age.range = [min, max];
          circles[0].actual = actualData.age;
        } else if (metric === 'Height') {
          actualData.height.q1 = q1;
          actualData.height.median = median;
          actualData.height.q3 = q3;
          actualData.height.range = [min, max];
          circles[1].actual = actualData.height;
        } else if (metric === 'Weight') {
          actualData.weight.q1 = q1;
          actualData.weight.median = median;
          actualData.weight.q3 = q3;
          actualData.weight.range = [min, max];
          circles[2].actual = actualData.weight;
        }
      }
    }

    p.draw = function () {
      p.clear();
      p.background('#111111');
      p.fill(255, 204, 0);
      p.textSize(20);
      p.text("Drag sliders to guess the Olympic medalist profile", 280, 40);
      p.textSize(13);
      p.fill(255, 220);
      p.text("Let's look at age, height, or weight distribution to see if there's a winning pattern in swimmers.", 340, 70);
      drawSliders(p);
      drawButton(p);
      drawUnitToggle(p);
    };

    function drawSliders(p) {
      p.push();
      p.translate(manager.offsetX, 100);

      var lineWidth = 600;

      circles.forEach((circle) => {
        p.stroke(60);
        p.strokeWeight(8);
        p.line(0, circle.lineY, lineWidth, circle.lineY);
        
        if (showAnswer) {
          var rangeStart = p.map(circle.actual.q1, circle.actual.range[0], circle.actual.range[1], 0, lineWidth);
          var rangeEnd = p.map(circle.actual.q3, circle.actual.range[0], circle.actual.range[1], 0, lineWidth);
          
          p.stroke(50, 200, 100, 150);
          p.strokeWeight(16);
          p.line(rangeStart, circle.lineY, rangeEnd, circle.lineY);
          
          var medianX = p.map(circle.actual.median, circle.actual.range[0], circle.actual.range[1], 0, lineWidth);
          p.stroke(50, 255, 100);
          p.strokeWeight(3);
          p.line(medianX, circle.lineY - 15, medianX, circle.lineY + 15);
          
          p.noStroke();
          p.fill(50, 255, 100);
          p.textSize(10);
          p.textAlign(p.CENTER, p.BOTTOM);
          p.text('Median', medianX, circle.lineY - 18);
        }
        
        p.noStroke();
        var isHovered = p.dist(p.mouseX - manager.offsetX, p.mouseY - 100, circle.x, circle.lineY) < 15;
        
        if (showAnswer) {
          var value = Math.round(p.map(circle.x, 0, 600, circle.actual.range[0], circle.actual.range[1]));
          var isCorrect = value >= circle.actual.q1 && value <= circle.actual.q3;
          
          if (circle.dragging || isHovered) {
            p.fill(isCorrect ? 100 : 255, isCorrect ? 255 : 220, isCorrect ? 120 : 100);
            p.circle(circle.x, circle.lineY, 22);
          }
          
          p.fill(isCorrect ? 50 : 255, isCorrect ? 255 : 180, isCorrect ? 100 : 50);
        } else {
          if (circle.dragging || isHovered) {
            p.fill(255, 220, 50);
            p.circle(circle.x, circle.lineY, 22);
          }
          p.fill(255, 204, 0);
        }
        
        p.circle(circle.x, circle.lineY, 18);
        
        p.fill(40);
        p.circle(circle.x, circle.lineY, 8);
      });

      p.noStroke();
      p.fill(255);
      p.textSize(18);
      p.textAlign(p.RIGHT, p.CENTER);
      
      circles.forEach((circle) => {
        p.text(circle.label, -20, circle.lineY);
      });

      p.textAlign(p.LEFT, p.CENTER);
      circles.forEach((circle) => {
        var value = Math.round(p.map(circle.x, 0, 600, circle.actual.range[0], circle.actual.range[1]));
        p.fill(255, 204, 0);
        p.textSize(20);
        p.text(getDisplayValue(circle, value), 620, circle.lineY);
      });

      p.fill(150);
      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);
      circles.forEach((circle) => {
        p.text(getDisplayValue(circle, circle.actual.range[0]), 0, circle.lineY + 15);
        p.text(getDisplayValue(circle, circle.actual.range[1]), 600, circle.lineY + 15);
      });

      if (showAnswer) {
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(12);
        
        circles.forEach((circle) => {
          var value = Math.round(p.map(circle.x, 0, 600, circle.actual.range[0], circle.actual.range[1]));
          var isCorrect = value >= circle.actual.q1 && value <= circle.actual.q3;
          
          if (isCorrect) {
            p.fill(50, 255, 100);
            p.text('Correct! Within typical range', 0, circle.lineY + 40);
          } else {
            p.fill(255, 180, 50);
            var rangeText = 'Typical range: ' + getDisplayValue(circle, circle.actual.q1) + '-' + getDisplayValue(circle, circle.actual.q3);
            p.text(rangeText, 0, circle.lineY + 40);
          }
        });
      }

      p.pop();
    }

    function drawButton(p) {
      var btnX = 355;
      var btnY = 350;
      var btnW = 150;
      var btnH = 40;
      
      var btnHovered = p.mouseX > btnX && p.mouseX < btnX + btnW && 
                       p.mouseY > btnY && p.mouseY < btnY + btnH;

      p.noStroke();
      p.fill(btnHovered ? 100 : 80, btnHovered ? 180 : 150, 100);
      p.rect(btnX, btnY, btnW, btnH, 8);

      p.fill(255);
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(showAnswer ? 'Try Again' : 'Check Answer', btnX + btnW / 2, btnY + btnH / 2);
    }

    function drawUnitToggle(p) {
      var toggleX = 650;
      var toggleY = 20;
      var toggleW = 180;
      var toggleH = 30;
      
      var toggleHovered = p.mouseX > toggleX && p.mouseX < toggleX + toggleW && 
                          p.mouseY > toggleY && p.mouseY < toggleY + toggleH;

      p.noStroke();
      p.fill(toggleHovered ? 70 : 50, toggleHovered ? 70 : 50, toggleHovered ? 70 : 50);
      p.rect(toggleX, toggleY, toggleW, toggleH, 5);

      p.fill(255);
      p.textSize(12);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(useImperial ? 'Change to Metric Units' : 'Change to Imperial Units', toggleX + toggleW / 2, toggleY + toggleH / 2);
    }

    p.mousePressed = function () {
      var toggleX = 650;
      var toggleY = 20;
      var toggleW = 180;
      var toggleH = 30;
      
      if (p.mouseX > toggleX && p.mouseX < toggleX + toggleW && 
          p.mouseY > toggleY && p.mouseY < toggleY + toggleH) {
        useImperial = !useImperial;
        return;
      }

      circles.forEach((circle) => {
        let d = p.dist(p.mouseX - manager.offsetX, p.mouseY - 100, circle.x, circle.lineY);
        if (d < 18) {
          circle.dragging = true;
        }
      });

      var btnX = 355;
      var btnY = 350;
      var btnW = 150;
      var btnH = 40;
      
      if (p.mouseX > btnX && p.mouseX < btnX + btnW && 
          p.mouseY > btnY && p.mouseY < btnY + btnH) {
        if (showAnswer) {
          circles[0].x = 100;
          circles[1].x = 400;
          circles[2].x = 300;
          showAnswer = false;
        } else {
          showAnswer = true;
        }
      }
    };

    p.mouseDragged = function () {
      circles.forEach((circle) => {
        if (circle.dragging) {
          circle.x = p.constrain(p.mouseX - manager.offsetX, 0, 600);
        }
      });
    };

    p.mouseReleased = function () {
      circles.forEach((circle) => {
        circle.dragging = false;
      });
    };
  });
})();