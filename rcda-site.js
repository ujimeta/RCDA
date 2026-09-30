/* =========================================================
   RCDA GLOBAL SITE SCRIPT — CMS v3
   =========================================================
   Purpose:
   1. Keep the official RCDA logo consistent across public pages.
   2. Load published content from Supabase.
   3. Support the current RCDA page structures.
   4. Provide explicit data-cms hooks for future section editing.
   ========================================================= */

(function () {
    "use strict";

    const SUPABASE_URL =
        "https://ttuiljvtnfimzcgqogme.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_nZYzfjOw8p5eVX_44n3rcw_ioi-IGXA";

    const RCDA_LOGO = "rcda-logo.png";


    /* =========================================================
       1. STANDARDIZE RCDA LOGO
       ========================================================= */

    function standardizeLogo() {

        document.querySelectorAll("header .logo").forEach(function (logo) {

            /*
             * Pages that already use an image logo.
             */
            const existingImage = logo.querySelector("img");

            if (existingImage) {

                existingImage.src = RCDA_LOGO;

                existingImage.alt =
                    "Rahama Community Development Association (RCDA) logo";

                existingImage.classList.add("rcda-global-logo");

                return;
            }


            /*
             * Older pages using .logo-emblem or .logo-box.
             */
            const oldEmblem =
                logo.querySelector(".logo-emblem") ||
                logo.querySelector(".logo-box");

            if (oldEmblem) {

                const img = document.createElement("img");

                img.src = RCDA_LOGO;

                img.alt =
                    "Rahama Community Development Association (RCDA) logo";

                img.className = "rcda-global-logo";

                logo.innerHTML = "";

                logo.appendChild(img);
            }
        });


        /*
         * Global logo sizing.
         */
        if (!document.getElementById("rcda-logo-global-style")) {

            const style = document.createElement("style");

            style.id = "rcda-logo-global-style";

            style.textContent = `
                header .rcda-global-logo {
                    display: block;
                    width: auto;
                    height: 62px;
                    max-width: 245px;
                    object-fit: contain;
                    object-position: left center;
                }

                @media (max-width: 900px) {
                    header .rcda-global-logo {
                        height: 52px;
                        max-width: 200px;
                    }
                }

                @media (max-width: 600px) {
                    header .rcda-global-logo {
                        height: 48px;
                        max-width: 180px;
                    }
                }
            `;

            document.head.appendChild(style);
        }
    }


    /* =========================================================
       2. DETERMINE CURRENT CMS PAGE KEY
       ========================================================= */

    function getPageKey() {

        let filename =
            window.location.pathname.split("/").pop();

        if (!filename || filename === "/") {
            filename = "index.html";
        }

        if (filename.toLowerCase() === "index.html") {
            return "home";
        }

        return filename.replace(/\.html$/i, "");
    }


    /* =========================================================
       3. LOAD SUPABASE
       ========================================================= */

    function loadSupabase(callback) {

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {
            callback();
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.async = true;

        script.onload = callback;

        script.onerror = function () {

            console.error(
                "RCDA CMS: Unable to load the Supabase library."
            );
        };

        document.head.appendChild(script);
    }


    /* =========================================================
       4. FIND CMS TARGETS
       =========================================================
       Explicit data-cms attributes take priority.

       Examples:

       data-cms="home-title"
       data-cms="home-subtitle"
       data-cms="home-content"
       data-cms="home-image"

       data-cms="who-we-are-title"
       data-cms="who-we-are-subtitle"
       data-cms="who-we-are-content"
       data-cms="who-we-are-image"
       ========================================================= */

    function getCmsTargets(pageKey) {

        const targets = {
            title: null,
            subtitle: null,
            content: null,
            image: null
        };


        /*
         * UNIVERSAL EXPLICIT CMS HOOKS
         */

        targets.title =
            document.querySelector(
                `[data-cms="${pageKey}-title"]`
            );

        targets.subtitle =
            document.querySelector(
                `[data-cms="${pageKey}-subtitle"]`
            );

        targets.content =
            document.querySelector(
                `[data-cms="${pageKey}-content"]`
            );

        targets.image =
            document.querySelector(
                `[data-cms="${pageKey}-image"]`
            );


        /*
         * HOMEPAGE FALLBACKS
         */

        if (pageKey === "home") {

            targets.title =
                targets.title ||
                document.querySelector(
                    ".hero-content h1"
                );

            targets.subtitle =
                targets.subtitle ||
                document.querySelector(
                    ".hero-content p"
                );

            targets.content =
                targets.content ||
                document.querySelector(
                    ".founder-message"
                );

            targets.image =
                targets.image ||
                document.querySelector(
                    ".hero-image"
                );

            return targets;
        }


        /*
         * INNER PAGE FALLBACKS
         *
         * The thematic pages use .page-header.
         */

        targets.title =
            targets.title ||
            document.querySelector(
                ".page-header h1"
            );

        targets.subtitle =
            targets.subtitle ||
            document.querySelector(
                ".page-header p"
            );


        /*
         * Pages such as Who We Are use
         * .page-content.
         */

        targets.title =
            targets.title ||
            document.querySelector(
                ".page-content h1"
            );

        targets.subtitle =
            targets.subtitle ||
            document.querySelector(
                ".page-content > p"
            );


        /*
         * IMPORTANT:
         *
         * We intentionally DO NOT automatically replace an
         * entire inner-page content area.
         *
         * The main content will only be replaced after we add
         * explicit data-cms="page-key-content" hooks.
         *
         * This protects the existing layouts.
         */

        return targets;
    }


    /* =========================================================
       5. SAFE CONTENT WRITERS
       ========================================================= */

    function setText(element, value) {

        if (!element || !value) {
            return;
        }

        element.textContent = value;
    }


    function setHtmlContent(element, value) {

        if (!element || !value) {
            return;
        }

        element.innerHTML =
            String(value).replace(
                /\n/g,
                "<br>"
            );
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
         * Supports background-image sections,
         * including the homepage hero.
         */

        element.style.backgroundImage =
            `url("${String(url).replace(/"/g, '\\"')}")`;
    }


    /* =========================================================
       6. LOAD PUBLISHED CONTENT
       ========================================================= */

    async function loadPublishedContent() {

        if (
            !window.supabase ||
            typeof window.supabase.createClient !== "function"
        ) {
            return;
        }


        const pageKey = getPageKey();

        const targets =
            getCmsTargets(pageKey);


        /*
         * If the page currently has no CMS targets,
         * leave it completely untouched.
         */

        if (
            !targets.title &&
            !targets.subtitle &&
            !targets.content &&
            !targets.image
        ) {
            return;
        }


        try {

            const client =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_PUBLISHABLE_KEY
                );


            const result =
                await client
                    .from("site_content")
                    .select(
                        "page_key,title,subtitle,content,image_url,status"
                    )
                    .eq(
                        "page_key",
                        pageKey
                    )
                    .eq(
                        "status",
                        "published"
                    )
                    .maybeSingle();


            if (result.error) {

                console.error(
                    "RCDA CMS error:",
                    result.error
                );

                return;
            }


            const data = result.data;


            /*
             * No published record:
             * keep the original static page.
             */

            if (!data) {
                return;
            }


            /* PAGE TITLE */

            if (
                targets.title &&
                data.title
            ) {

                setText(
                    targets.title,
                    data.title
                );
            }


            /* PAGE SUBTITLE */

            if (
                targets.subtitle &&
                data.subtitle
            ) {

                setText(
                    targets.subtitle,
                    data.subtitle
                );
            }


            /* MAIN CMS CONTENT */

            if (
                targets.content &&
                data.content
            ) {

                setHtmlContent(
                    targets.content,
                    data.content
                );
            }


            /* FEATURED IMAGE */

            if (
                targets.image &&
                data.image_url
            ) {

                setImage(
                    targets.image,
                    data.image_url
                );
            }


            /*
             * Synchronize browser title on homepage.
             */

            if (
                pageKey === "home" &&
                data.title
            ) {

                document.title =
                    data.title +
                    " | Rahama Community Development Association (RCDA)";
            }


            /*
             * Development confirmation.
             */

            console.info(
                "RCDA CMS loaded published content:",
                pageKey
            );

        }

        catch (error) {

            console.error(
                "RCDA CMS unexpected error:",
                error
            );
        }
    }


    /* =========================================================
       7. INITIALIZE
       ========================================================= */

    function initialize() {

        /*
         * Logo does not depend on Supabase.
         */

        standardizeLogo();


        /*
         * CMS loading happens separately.
         */

        loadSupabase(function () {

            loadPublishedContent();

        });
    }


    /* =========================================================
       8. START
       ========================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();
