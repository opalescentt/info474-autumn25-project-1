// sections.js
// Orchestrator: loads data, starts the p5 sketch, and wires scroll -> visual state

(function () {
  function displayData() {
    // Configuration: defaults, then window.ScrollDemoConfig, then data-attributes on the container
    var defaults = {
      containerSelector: "#graphic",
      stepSelector: ".step",
      visSelector: "#vis",
      showAt: 0,
      // trigger: where on the viewport a step becomes "active".
      // 'center' => when the step reaches the vertical center of the viewport
      // 'top' => when the step reaches the top (small offset)
      trigger: "top",
      visHiddenClass: "vis-hidden",
      visVisibleClass: "vis-visible",
    };

    var cfg = Object.assign({}, defaults, window.ScrollDemoConfig || {});
    // allow data- attributes on container to override
    try {
      var containerEl = document.querySelector(cfg.containerSelector);
      if (containerEl && containerEl.dataset) {
        if (containerEl.dataset.showAt)
          cfg.showAt = parseInt(containerEl.dataset.showAt, 10) || cfg.showAt;
        if (containerEl.dataset.trigger)
          cfg.trigger = containerEl.dataset.trigger;
        if (containerEl.dataset.stepSelector)
          cfg.stepSelector = containerEl.dataset.stepSelector;
        if (containerEl.dataset.visSelector)
          cfg.visSelector = containerEl.dataset.visSelector;
        if (containerEl.dataset.visHiddenClass)
          cfg.visHiddenClass = containerEl.dataset.visHiddenClass;
        if (containerEl.dataset.visVisibleClass)
          cfg.visVisibleClass = containerEl.dataset.visVisibleClass;
      }
    } catch (e) {
      /* ignore */
    }

    // Ensure the vis element starts hidden according to configured class
    // If showAt is 0 we want the visual visible immediately, so only
    // add the hidden class when showAt > 0.
    try {
      var visStartEl = document.querySelector(cfg.visSelector);
      if (visStartEl && (cfg.showAt || 0) > 0) {
        visStartEl.classList.add(cfg.visHiddenClass);
      }
    } catch (e) {}

    // Start p5 sketch with retries if startP5 isn't defined yet.
    (function callStartP5WithRetry(attempts) {
      attempts = typeof attempts === "number" ? attempts : 3;
      if (typeof startP5 === "function") {
        try {
          console.log("sections: calling startP5 (attempts left)", attempts);
          var api = startP5();

          // If the returned API exposes a `ready` promise, wait for it
          // to resolve before exposing the API globally. This ensures
          // consumers of `window.__sketchAPI` see the populated data.
          if (api && api.ready && typeof api.ready.then === "function") {
            api.ready
              .then(function () {
                try {
                  if (api && api.setState) window.__sketchAPI = api;
                  window.__sections_startCalled = true;
                  console.log("sections: startP5 ready and api exposed");
                } catch (e) {
                  console.error("sections: error exposing api after ready", e);
                }
              })
              .catch(function (err) {
                console.error("sections: startP5 ready promise rejected", err);
                if (api && api.setState) window.__sketchAPI = api;
              });
          } else {
            if (api && api.setState) {
              window.__sketchAPI = api;
            }
            window.__sections_startCalled = true;
            console.log("sections: startP5 invoked successfully");
          }

          // Create scroller and wire up events (using configured selectors)
          var ScrollerCtor = window.Scroller;
          if (!ScrollerCtor) {
            console.error("sections: Scroller not available");
            return;
          }
          var sc = new ScrollerCtor(
            cfg.containerSelector,
            cfg.stepSelector,
            cfg.trigger
          );
          console.log("sections: scroller created, steps=", sc.steps.length);

          // create VisualController to show/hide #vis when appropriate
          var VisualControllerCtor = window.VisualController;
          var visualController = null;
          if (VisualControllerCtor) {
            visualController = new VisualControllerCtor({
              visSelector: cfg.visSelector,
              showAt: cfg.showAt,
            });
          }

          sc.on("active", function (index) {
            // highlight steps (light coupling — just visual text opacity)
            document.querySelectorAll(".step").forEach(function (el, i) {
              el.style.opacity = "1";
              el.style.transition = "opacity 0.3s ease";
            });

            // Determine if the active step defines a custom active-index
            var mappedIndex = index;
            try {
              var stepEl =
                sc.steps && sc.steps[index]
                  ? sc.steps[index]
                  : document.querySelectorAll(cfg.stepSelector)[index];
              if (
                stepEl &&
                stepEl.dataset &&
                stepEl.dataset.activeIndex !== undefined
              ) {
                var parsed = parseInt(stepEl.dataset.activeIndex, 10);
                if (!isNaN(parsed)) mappedIndex = parsed;
              }
            } catch (e) {
              /* ignore and fall back to raw index */
            }

            // update sketch state via returned API if available (use mappedIndex)
            if (window.__sketchAPI && window.__sketchAPI.setState) {
              window.__sketchAPI.setState({ activeIndex: mappedIndex });
            }

            // let visual controller decide whether to show/hide (give it the mapped index)
            if (visualController) visualController.handleActive(mappedIndex);
          });

          sc.on("progress", function (index, progress) {
            // Map index to any per-section activeIndex so the sketch receives
            // a consistent activeIndex value during progress updates.
            var mappedIndex = index;
            try {
              var stepEl =
                sc.steps && sc.steps[index]
                  ? sc.steps[index]
                  : document.querySelectorAll(cfg.stepSelector)[index];
              if (
                stepEl &&
                stepEl.dataset &&
                stepEl.dataset.activeIndex !== undefined
              ) {
                var parsed = parseInt(stepEl.dataset.activeIndex, 10);
                if (!isNaN(parsed)) mappedIndex = parsed;
              }
            } catch (e) {
              /* ignore */
            }

            if (window.__sketchAPI && window.__sketchAPI.setState) {
              window.__sketchAPI.setState({
                progress: progress,
                activeIndex: mappedIndex,
              });
            }
            if (visualController)
              visualController.handleProgress(mappedIndex, progress);
          });
        } catch (err) {
          console.error("sections: startP5 threw an error", err);
        }
      } else if (attempts > 0) {
        console.warn(
          "sections: startP5 not ready, retrying in 200ms (attempts left)",
          attempts
        );
        setTimeout(function () {
          callStartP5WithRetry(attempts - 1);
        }, 200);
      } else {
        console.error(
          "sections: startP5 not available after retries — p5 visual will not start"
        );
      }
    })(3);
  }

  // run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", displayData);
  } else {
    displayData();
  }
  
})();
