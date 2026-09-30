/* =========================================================
   RCDA GLOBAL SITE + CMS CONNECTOR
   ---------------------------------------------------------
   Purpose:
   1. Standardize the official RCDA logo across public pages.
   2. Load published content from Supabase site_content.
   3. Preserve the existing RCDA page design.
   ========================================================= */

(function () {
    "use strict";

    const SUPABASE_URL = "https://ttuiljvtnfimzcgqogme.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_nZYzfjOw8p5eVX_44n3rcw_ioi-IGXA";

    /*
     * Keep the logo local to the repository so every page uses
     * the same official image.
     */
    const RCDA_LOGO = "rcda-logo.png";

    /*
     * Load Supabase only if it has not already been loaded.
     */
    function loadSupabase(callback) {
        if (window.supabase && typeof window.supabase.createClient === "function") {
            callback();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.async = true;
        script.onload = callback;
        script.onerror = function () {
            console.error("RCDA CMS: Unable to load Supabase.");
        };

        document.head.appendChild(script);
    }

    /*
     * Normalize the official RCDA logo.
     *
     * Existing pages currently use two logo patterns:
     *   - <img> based logo
     *   - old "R / RCDA / Nigeria" placeholder
     *
     * This function supports both without requiring the page
     * to be redesigned.
     */
    function standardizeLogo() {
        const imageLogos = document.querySelectorAll(
            ".logo img, header img[alt*='RCDA'], header img[src*='rcda-logo']"
        );

        imageLogos.forEach(function (img) {
            img.src = RCDA_LOGO;
            img.alt = "Rahama Community Development Association (RCDA) logo";
            img.loading = "eager";
            img.decoding = "async";
        });

        /*
         * Replace the old circular R placeholder with the actual
         * logo image while preserving the existing .logo link.
         */
        document.querySelectorAll("header .logo").forEach(function (logo) {
            const placeholder = logo.querySelector(".logo-emblem");

            if (!placeholder) {
                return;
            }

            const img = document.createElement("img");
            img.src = RCDA_LOGO;
            img.alt = "Rahama Community Development Association (RCDA) logo";
            img.loading = "eager";
            img.decoding = "async";

            logo.innerHTML = "";
            logo.appendChild(img);
        });

        /*
         * Add a small amount of consistent logo styling without
         * overriding the page's broader design.
         */
        if (!document.getElementById("rcda-global-logo-style")) {
            const style = document.createElement("style");
            style.id = "rcda-global-logo-style";
            style.textContent = `
                header .logo img {
                    display: block;
                    width: auto;
                    height: 62px;
                    max-width: 245px;
                    object-fit: contain;
                    object-position: left center;
                }

                @media (max-width: 900px) {
                    header .logo img {
                        height: 52px;
                        max-width: 190px;
                    }
                }

                @media (max-width: 600px) {
                    header .logo img {
                        height: 48px;
                        max-width: 175px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /*
     * Determine the CMS page key from the current filename.
     */
    function getPageKey() {
        const path = window.location.pathname;
        let filename = path.split("/").pop() || "index.html";

        if (!filename || filename === "/") {
            filename = "index.html";
        }

        if (filename.toLowerCase() === "index.html") {
            return "home";
        }

        return filename.replace(/\.html$/i, "");
    }

    /*
     * Find the appropriate elements on the existing page.
     * Explicit data-cms attributes always take priority.
     */
    function getCmsTargets(pageKey) {
        if (pageKey === "home") {
            return {
                title:
                    document.querySelector('[data-cms="home-title"]') ||
                    document.querySelector(".hero-content h1"),

                subtitle:
                    document.querySelector('[data-cms="home-subtitle"]') ||
                    document.querySelector(".hero-content p"),

                content:
                    document.querySelector('[data-cms="home-content"]') ||
                    document.querySelector(".founder-message"),

                image:
                    document.querySelector('[data-cms="home-image"]') ||
                    document.querySelector(".hero-image")
            };
        }

        return {
            title:
                document.querySelector(`[data-cms="${pageKey}-title"]`) ||
                document.querySelector(".page-hero h1") ||
                document.querySelector(".page-content h1") ||
                document.querySelector("main h1"),

            subtitle:
                document.querySelector(`[data-cms="${pageKey}-subtitle"]`) ||
                document.querySelector(".page-hero p") ||
                document.querySelector(".page-content > p") ||
                document.querySelector("main > p"),

            content:
                document.querySelector(`[data-cms="${pageKey}-content"]`) ||
                document.querySelector(".page-content"),

            image:
                document.querySelector(`[data-cms="${pageKey}-image"]`) ||
                document.querySelector(".page-hero img")
        };
    }

    function setText(element, value) {
        if (!element || !value) {
            return;
        }

        element.textContent = value;
    }

    function setContent(element, value) {
        if (!element || !value) {
            return;
        }

        /*
         * For explicitly marked CMS content, allow basic HTML.
         * For the current fallback founder-message, use plain text
         * with line breaks to avoid replacing page structure.
         */
        if (element.hasAttribute("data-cms")) {
            element.innerHTML = value.replace(/\n/g, "<br>");
        } else if (element.classList.contains("founder-message")) {
            element.textContent = value;
        }
    }

    function setImage(element, url) {
        if (!element || !url) {
            return;
        }

        if (element.tagName === "IMG") {
            element.src = url;
            return;
        }

        /*
         * The current homepage hero uses a CSS background image.
         */
        if (element.classList.contains("hero-image")) {
            element.style.backgroundImage =
                `linear-gradient(rgba(8, 46, 34, 0.12), rgba(8, 46, 34, 0.12)), url("${url}")`;
        }
    }

    async function loadPublishedContent() {
        if (!window.supabase || !window.supabase.createClient) {
            return;
        }

        const pageKey = getPageKey();
        const targets = getCmsTargets(pageKey);

        try {
            const client = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

            const { data, error } = await client
                .from("site_content")
                .select("page_key, title, subtitle, content, image_url, status")
                .eq("page_key", pageKey)
                .eq("status", "published")
                .maybeSingle();

            if (error) {
                console.error("RCDA CMS:", error);
                return;
            }

            if (!data) {
                return;
            }

            /*
             * The title and subtitle update the visible page while
             * preserving the existing layout.
             */
            setText(targets.title, data.title);
            setText(targets.subtitle, data.subtitle);

            /*
             * Only explicitly marked content areas are allowed to
             * replace structured page content. On the existing
             * homepage, the fallback is the founder message.
             */
            setContent(targets.content, data.content);

            setImage(targets.image, data.image_url);

            /*
             * Keep the browser title useful when CMS title exists.
             */
            if (data.title && pageKey === "home") {
                document.title =
                    data.title + " | Rahama Community Development Association (RCDA)";
            }

        } catch (error) {
            console.error("RCDA CMS: Unexpected error.", error);
        }
    }

    function initialize() {
        standardizeLogo();

        loadSupabase(function () {
            loadPublishedContent();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }

})();
