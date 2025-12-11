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

    let menTable;
    let menYears = [];
    let menCounts = [];

    let menLookup = {};

    new p5(function (p) {
        p.preload = () => {
            table = p.loadTable("data/swimming_participation.csv", "csv", "header");
            menTable = p.loadTable("data/men_swimming_participation.csv", "csv", "header");
        }

        p.setup = function()  {
            const canvas = p.createCanvas(850, 400);
            canvas.parent("viz_participation");

            for (let r = 0; r < table.getRowCount(); r++) {
                years.push(table.getNum(r, "Year"));
                counts.push(table.getNum(r, "Athlete"));
            }

            for (let r = 0; r < menTable.getRowCount(); r++) {
                menYears.push(menTable.getNum(r, "Year"));
                menCounts.push(menTable.getNum(r, "Athlete"));
            }

            menLookup = {};
            for (let i = 0; i < menYears.length; i++) {
                menLookup[menYears[i]] = menCounts[i];
            }
        }

        p.draw = function () {
            p.clear();
        
            let margin = 60;

            let allYears = years.concat(menYears);
            let allCounts = counts.concat(menCounts);
            
            let minYear = Math.min(...allYears);
            let maxYear = Math.max(...allYears);
            let minCount = Math.min(...allCounts);
            let maxCount = Math.max(...allCounts);
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
            p.text("Number of Athletes", 0, 0);
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
                if (!allYears.includes(year)) continue;
            
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
            p.stroke("#FCB131");
            p.strokeWeight(3);

            for (let i = 0; i < years.length - 1; i++) {
                let y1 = years[i];
                let y2 = years[i + 1];

                let isWarGap =
                    (y1 === 1912 && y2 === 1916) ||
                    (y1 === 1916 && y2 === 1920) ||
                    (y1 === 1936 && y2 === 1940) ||
                    (y1 === 1940 && y2 === 1944) ||
                    (y1 === 1944 && y2 === 1948);

                if (isWarGap) continue;

                let x1 = p.map(y1, minYear, maxYear, margin, p.width - margin);
                let p1 = p.map(counts[i], minCount, maxCount, p.height - margin, margin);

                let x2 = p.map(y2, minYear, maxYear, margin, p.width - margin);
                let p2 = p.map(counts[i + 1], minCount, maxCount, p.height - margin, margin);

                p.line(x1, p1, x2, p2);
            }

            p.stroke("#4DA6FF");
            p.strokeWeight(3);

            for (let i = 0; i < menYears.length - 1; i++) {
                let y1 = menYears[i];
                let y2 = menYears[i + 1];

                let isWarGap =
                    (y1 === 1912 && y2 === 1916) ||
                    (y1 === 1916 && y2 === 1920) ||
                    (y1 === 1936 && y2 === 1940) ||
                    (y1 === 1940 && y2 === 1944) ||
                    (y1 === 1944 && y2 === 1948);

                if (isWarGap) continue;

                let x1 = p.map(menYears[i], minYear, maxYear, margin, p.width - margin);
                let p1 = p.map(menCounts[i], minCount, maxCount, p.height - margin, margin);

                let x2 = p.map(menYears[i + 1], minYear, maxYear, margin, p.width - margin);
                let p2 = p.map(menCounts[i + 1], minCount, maxCount, p.height - margin, margin);

                p.line(x1, p1, x2, p2);
            }


            // Tooltip detection
            let hoveredIndex = -1;
            let hoveredSource = null;

            // Draw Points + hover detection
            let hoveredYear = null;

            // Check women points
            for (let i = 0; i < years.length; i++) {
                let x = p.map(years[i], minYear, maxYear, margin, p.width - margin);
                let y = p.map(counts[i], minCount, maxCount, p.height - margin, margin);
            
                if (p.dist(p.mouseX, p.mouseY, x, y) < 8) {
                    hoveredYear = years[i];
                    hoveredSource = "women";
                }
            
                p.fill("#FCB131");
                p.noStroke();
                p.circle(x, y, 6);
            }
            
            // Check men points
            for (let i = 0; i < menYears.length; i++) {
                let x = p.map(menYears[i], minYear, maxYear, margin, p.width - margin);
                let y = p.map(menCounts[i], minCount, maxCount, p.height - margin, margin);
            
                if (p.dist(p.mouseX, p.mouseY, x, y) < 8) {
                    hoveredYear = menYears[i];
                    hoveredSource = "men";
                }
            
                p.fill("#4DA6FF");
                p.noStroke();
                p.circle(x, y, 6);
            }

            // Tooltip
            if (hoveredYear !== null) {
                let womenIndex = years.indexOf(hoveredYear);
                let menValue = menLookup[hoveredYear];   // undefined if men don't have this year
            
                let x = p.map(hoveredYear, minYear, maxYear, margin, p.width - margin);
            
                // Pick women y-position if available, otherwise men
                let y;

                if (hoveredSource === "women") {
                    y = p.map(counts[womenIndex], minCount, maxCount, p.height - margin, margin);
                } else {
                    y = p.map(menValue, minCount, maxCount, p.height - margin, margin);
                }
                            
                let isWw2 = hoveredYear === 1940 || hoveredYear === 1944;
                let ww1 = hoveredYear === 1916;
            
                // Tooltip box size
                let lines = [];
            
                if (isWw2) {
                    lines.push(hoveredYear + " Canceled");
                    lines.push("No Olympics due to World War II");
                } else if (ww1) {
                    lines.push(hoveredYear + " Canceled");
                    lines.push("No Olympics due to World War I");
                } else {
                    lines.push("Year: " + hoveredYear);
            
                    if (womenIndex !== -1) {
                        lines.push("Women: " + counts[womenIndex]);
                    }
                    if (menValue !== undefined) {
                        lines.push("Men: " + menValue);
                    }
                }
            
                let boxWidth = 170;
                let boxHeight = 18 * lines.length + 10;
            
                // Draw highlight circle
                p.fill(255);
                p.stroke(255);
                p.strokeWeight(2);
                p.circle(x, y, 10);
            
                // Tooltip box
                p.noStroke();
                p.fill(255);
                p.rect(x + 12, y - boxHeight + 5, boxWidth, boxHeight, 5);
            
                // Tooltip text
                p.fill(0);
                p.textSize(12);
                p.textAlign(p.LEFT, p.CENTER);
            
                for (let i = 0; i < lines.length; i++) {
                    p.text(lines[i], x + 18, y - boxHeight + 20 + i * 18);
                }
            }

            p.fill("#FCB131");
            p.circle(120, 60, 10);
            p.fill(255);
            p.text("Women", 150, 63);

            p.fill("#4DA6FF");
            p.circle(220, 60, 10);
            p.fill(255);
            p.text("Men", 240, 63);
        };
    });

    if (typeof window.sketch_manager !== "undefined") {
        window.sketch_manager.register("viz_participation", manager);
    }
})();
