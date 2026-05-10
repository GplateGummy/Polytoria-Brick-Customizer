// ==UserScript==
// @name         Polytoria Brick Customizer
// @namespace    polytoria-brick-customizer
// @version      6.7.4
// @description  Brick Customizer
// @match        https://polytoria.com/*
// @match        https://www.polytoria.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    const ICON_URL = "https://www.pngarts.com/files/18/Tung-Tung-Tung-Sahur-Transparent-HQ.png"; // Custom brick icon
    const MULTIPLIER = 1; // Multiply your brick value and get rich or poor (visual only)
    const COLOR = "#C55616"; // Custom brick color

    function getHue(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;
        let max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h,
            d = max - min;
        if (d === 0) h = 0;
        else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return h * 360;
    }

    const targetHue = getHue(COLOR);
    const greenHue = 114;
    const galaxyHue = 278;

    const rotateGreen = Math.floor(targetHue - greenHue);
    const rotateGalaxy = Math.floor(targetHue - galaxyHue);

    GM_addStyle(`
    .brick-package {
      filter: hue-rotate(${rotateGreen}deg) !important;
    }

    .brick-package.galaxy {
      filter: hue-rotate(${rotateGalaxy}deg) !important;
    }
    
    .brickBalance span {
      color: ${COLOR} !important;
    }

    .btn-outline-success:not(:has(.fa-save)) {
      --bs-btn-color: ${COLOR} !important;
      --bs-btn-border-color: ${COLOR} !important;
      --bs-btn-hover-bg: ${COLOR} !important;
      --bs-btn-hover-border-color: ${COLOR} !important;
      --bs-btn-active-bg: ${COLOR} !important;
      --bs-btn-active-border-color: ${COLOR} !important;
      --bs-btn-disabled-color: ${COLOR} !important;
      --bs-btn-disabled-border-color: ${COLOR} !important;
    }

    .text-success:not(:has(.fa-user)):not(:has(.fa-shopping-cart)):not(:has(.fa-globe)) {
      color: ${COLOR} !important;
    }

    i.pi.pi-brick {
      font-size: 0 !important;
      color: transparent !important;
      display: inline-block !important;
      width: 1rem !important;
      height: 1rem !important;
      background-image: url("${ICON_URL}") !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      vertical-align: middle !important;
    }

    i.pi.pi-brick-value {
      font-size: 0 !important;
      color: transparent !important;
      display: inline-block !important;
      width: 1rem !important;
      height: 1rem !important;
      background-image: url("${ICON_URL}") !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      vertical-align: middle !important;
    }
  `);

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attributes) {
        const context = originalGetContext.call(this, type, attributes);

        if (type === "2d" && this.id === "price-chart") {
            const wrapper = (obj, prop) => {
                const original = obj[prop];
                obj[prop] = function () {
                    if (this.fillStyle === "#4fe883") {
                        this.fillStyle = COLOR;
                    }
                    if (this.strokeStyle === "#4fe883") {
                        this.strokeStyle = COLOR;
                    }
                    return original.apply(this, arguments);
                };
            };

            wrapper(context, "fillRect");
            wrapper(context, "stroke");
            wrapper(context, "fillText");
            wrapper(context, "beginPath");
        }
        return context;
    };

    let applied = false;

    function applyMultiplier(el) {
        if (applied) return;
        const raw = parseFloat(el.textContent.replace(/[^0-9.]/g, ""));
        if (isNaN(raw)) return;
        applied = true;
        el.textContent = (raw * MULTIPLIER).toLocaleString("en-US");
    }

    const bodyObserver = new MutationObserver(() => {
        const el = document.querySelector(".brickBalanceCount");
        if (!el) return;
        bodyObserver.disconnect();
        applyMultiplier(el);
    });

    document.addEventListener("DOMContentLoaded", () => {
        const el = document.querySelector(".brickBalanceCount");
        if (el) {
            applyMultiplier(el);
        } else {
            bodyObserver.observe(document.body, { childList: true, subtree: true });
        }
    });
})();
