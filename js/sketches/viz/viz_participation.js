(function () {
    var manager = {
      margin: { top: 40, right: 40, bottom: 40, left: 80 },
      offsetX: 80,
      offsetY: 40,
      data: null
    };

    let table;
    let years = [];
    let counts = [];

    new p5(function (p) {
        p.preload = () => {
            table = p.loadTable("data/swimming_participation.csv", "csv", "header");
        }

        p.setup = function()  {
            const canvas = p.createCanvas(850, 400);
            canvas.parent("viz_participation");

            for (let r = 0; r < table.getRowCount(); r++) {
                years.push(table.getNum(r, "Year"));
                counts.push(table.getNum(r, "Athlete"));
            }
        }

        p.draw = function () {
            p.clear();
            p.background(0);
        
            let margin = 60;
        
            let minYear = Math.min(...years);
            let maxYear = Math.max(...years);
            let minCount = Math.min(...counts);
            let maxCount = Math.max(...counts);
        
            p.stroke(255);
            p.strokeWeight(2)
            p.line(margin, p.height - margin, p.width - margin, p.height - margin);  
            p.line(margin, margin, margin, p.height - margin); 

            // axis labels
            p.fill(255);
            p.noStroke();
            p.textSize(16);
            p.textAlign(p.CENTER);
            p.text("Year", p.width / 2, p.height - 20);

            p.push();
            p.translate(17, p.height / 2);
            p.rotate(-p.HALF_PI);
            p.text("Number of Women Athletes", 0, 0);
            p.pop();
        
            // title
            p.textSize(20);
            p.textAlign(p.CENTER);
            p.text("Women's Participation in Olympic Swimming (1912–2016)", p.width / 2, 30);

            p.textSize(12);
            p.fill(255);

                // X-axis ticks (years)
            let tickInterval = 8;  // choose: 4, 8, 12, etc.

            for (let year = minYear; year <= maxYear; year += tickInterval) {
                if (!years.includes(year)) continue;
            
                let x = p.map(year, minYear, maxYear, margin, p.width - margin);
            
                p.stroke(255);
                p.line(x, p.height - margin - 5, x, p.height - margin + 5);
            
                p.noStroke();
                p.text(year, x, p.height - margin + 20);
            }

            // Y-axis ticks (counts)
            let step = 20;
            for (let c = minCount; c <= maxCount; c += step) {
                let y = p.map(c, minCount, maxCount, p.height - margin, margin);
                p.stroke(255);
                p.line(margin - 5, y, margin + 5, y);
                p.noStroke();
                p.text(c, margin - 25, y + 5);
            }

            p.noFill();
            p.stroke(0, 150, 255);
            p.strokeWeight(3);
            p.beginShape();
            for (let i = 0; i < years.length; i++) {
                let x = p.map(years[i], minYear, maxYear, margin, p.width - margin);
                let y = p.map(counts[i], minCount, maxCount,p.height - margin, margin);
                p.vertex(x, y);
            }
            p.endShape();

            // Tooltip detection
            let hoveredIndex = -1;

            // Draw Points + hover detection
            for (let i = 0; i < years.length; i++) {
                let x = p.map(years[i], minYear, maxYear, margin, p.width - margin);
                let y = p.map(counts[i], minCount, maxCount, p.height - margin, margin);

                if (p.dist(p.mouseX, p.mouseY, x, y) < 8) {
                    hoveredIndex = i;
                }

                p.fill(0, 150, 255);
                p.noStroke();
                p.circle(x, y, 6);
            }

            // Tooltip
            if (hoveredIndex !== -1) {
                let year = years[hoveredIndex];
                let count = counts[hoveredIndex];

                let x = p.map(year, minYear, maxYear, margin, p.width - margin);
                let y = p.map(count, minCount, maxCount, p.height - margin, margin);

                let isWw2 = year === 1940 || year === 1944;
                let ww1 = year === 1916

                // Highlight point (blue normally, red for 1940/44)
                if (isWw2 || ww1) {
                    p.fill(255, 80, 80);
                    p.stroke(255, 80, 80);
                } else {
                    p.fill(255);
                    p.stroke(255);
                }
                p.strokeWeight(2);
                p.circle(x, y, 10);

                let boxWidth = (isWw2 || ww1) ? 220 : 160;
                let boxHeight = (isWw2 || ww1) ? 50 : 40;

                // Tooltip box
                p.noStroke();
                p.fill(255);
                p.rect(x + 12, y - 45, boxWidth, boxHeight, 5);

                // Tooltip text
                p.fill(0);
                p.textSize(12);
                p.textAlign(p.LEFT, p.CENTER);

                if (isWw2) {
                    p.text(year + " — Games canceled", x + 18, y - 30);
                    p.text("No Olympics due to World War II", x + 18, y - 15);
                } else if (ww1) {
                    p.text(year + " — Games canceled", x + 18, y - 30);
                    p.text("No Olympics due to World War I", x + 18, y - 15);
                } else {
                    p.text("Year: " + year, x + 18, y - 30);
                    p.text("Athletes: " + count, x + 18, y - 15);
                }
            }
        };
    });

    if (typeof window.sketch_manager !== "undefined") {
        window.sketch_manager.register("viz_participation", manager);
    }
})();
