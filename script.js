// =====================================================
// OPTIVAULT — SLOT MAP + INTRO ANIMATION + THEME
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const grid = document.getElementById("slotGrid");
    const message = document.getElementById("optivaultMessage");
    const toggle = document.getElementById("themeToggle");
    const root = document.documentElement;


    // =================================================
    // CREATE SLOT MAP
    // =================================================

    if (grid) {

        const layout = [
            2, 1, 0, 2, 1, 0, 1, 0, 2, 1, 1, 0,
            1, 0, 2, 1, 0, 2, 1, 1, 0, 1, 0, 2,
            0, 1, 2, 1, 1, 0, 2, 1, 0, 1, 0, 0,
            2, 1, 0, 0, 2, 1, 0, 1, 0, 2, 1, 0
        ];

        const classes = [
            "",
            "g",
            "o"
        ];

        grid.innerHTML = "";

        // Create all 48 slots
        layout.forEach(function (value) {

            const slot = document.createElement("span");

            if (classes[value]) {
                slot.classList.add(classes[value]);
            }

            grid.appendChild(slot);

        });


        // =================================================
        // GET ALL SLOTS
        // =================================================

        const slots = Array.from(
            grid.querySelectorAll("span")
        );


        // =================================================
        // INTRO ANIMATION
        // =================================================

        /*
            48 boxes
            12 boxes per row

            ROW 1 → LEFT TO RIGHT
            ROW 2 → LEFT TO RIGHT
            ROW 3 → LEFT TO RIGHT
            ROW 4 → LEFT TO RIGHT
        */

        const startDelay = 1000;

        // Time between each box
        const blockDelay = 100;


        setTimeout(function () {

            slots.forEach(function (slot, index) {

                setTimeout(function () {

                    // This class is handled by CSS
                    slot.classList.add("box-hide");

                }, index * blockDelay);

            });


            // =================================================
            // SHOW WELCOME MESSAGE AFTER LAST BOX
            // =================================================

            const lastBlockTime =
                (slots.length - 1) * blockDelay;


            setTimeout(function () {

                if (message) {
                    message.classList.add("show");
                }

            }, lastBlockTime + 600);


        }, startDelay);

    }


    // =====================================================
    // DARK / LIGHT MODE
    // =====================================================

    if (toggle) {

        const savedTheme =
            localStorage.getItem("slotwise-theme");

        const systemDark =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        const initialTheme =
            savedTheme ||
            (systemDark ? "dark" : "light");


        function applyTheme(theme) {

            root.setAttribute(
                "data-theme",
                theme
            );

            const isDark =
                theme === "dark";

            const label =
                toggle.querySelector(
                    ".theme-label"
                );

            const icon =
                toggle.querySelector(
                    ".theme-icon"
                );


            if (label) {

                label.textContent =
                    isDark
                        ? "LIGHT"
                        : "DARK";

            }


            if (icon) {

                icon.textContent =
                    isDark
                        ? "☀"
                        : "◐";

            }


            toggle.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );

            toggle.setAttribute(
                "title",
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );

        }


        // Apply saved/system theme
        applyTheme(initialTheme);


        // Theme toggle
        toggle.addEventListener(
            "click",
            function () {

                const currentTheme =
                    root.getAttribute(
                        "data-theme"
                    );

                const nextTheme =
                    currentTheme === "dark"
                        ? "light"
                        : "dark";


                localStorage.setItem(
                    "slotwise-theme",
                    nextTheme
                );


                applyTheme(nextTheme);

            }
        );

    }

});