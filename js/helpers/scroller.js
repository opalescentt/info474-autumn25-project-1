// scroller.js
// Small Scroller abstraction (extracted from sections_p5.js) that computes
// active step index and progress and exposes a lightweight .on(action, cb)
(function () {
  function Scroller(containerSelector, stepSelector, trigger) {
    this.container = document.querySelector(containerSelector) || document.body;
    this.steps = Array.prototype.slice.call(
      document.querySelectorAll(stepSelector)
    );
    // sectionPositions will store absolute page Y positions (window.pageYOffset + element top)
    this.sectionPositions = [];
    this.trigger = trigger || "top"; // 'top' or 'center'
    this.currentIndex = -1;
    this.onActive = function () {};
    this.onProgress = function () {};

    var self = this;
    this.resize = function () {
      self.sectionPositions = [];
      self.steps.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var top = rect.top + window.pageYOffset;
        // Always use element top as the activation point
        self.sectionPositions.push(top);
      });
    };

    this.position = function () {
      // Always trigger at viewport center
      var triggerY = window.pageYOffset + window.innerHeight / 2;

      var sectionIndex = 0;
      // Loop backwards to find the last section whose top is <= triggerY
      for (var i = self.sectionPositions.length - 1; i >= 0; i--) {
        if (triggerY >= self.sectionPositions[i]) {
          sectionIndex = i;
          break;
        }
      }

      // clamp to valid range
      sectionIndex = Math.max(
        0,
        Math.min(self.sectionPositions.length - 1, sectionIndex)
      );

      if (self.currentIndex !== sectionIndex) {
        self.currentIndex = sectionIndex;
        self.onActive(sectionIndex);
      }

      // Compute progress
      var elem = self.steps[sectionIndex];
      if (!elem) return;
      var rect = elem.getBoundingClientRect();
      var elemTop = rect.top + window.pageYOffset;
      var elemHeight = rect.height || 1;
      var rawSectionProgress = (triggerY - elemTop) / elemHeight;
      var progress = Math.max(0, Math.min(1, rawSectionProgress));
      self.onProgress(sectionIndex, progress);
    };

    window.addEventListener("resize", this.resize);
    window.addEventListener("scroll", this.position);
    setTimeout(function () {
      self.resize();
      self.position();
    }, 50);
  }

  Scroller.prototype.on = function (action, cb) {
    if (action === "active") {
      this.onActive = cb;
    }
    if (action === "progress") {
      this.onProgress = cb;
    }
    return this;
  };

  window.Scroller = Scroller;
})();
