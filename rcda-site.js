/* =========================================================
   RCDA GLOBAL SITE SCRIPT — CMS v4
   =========================================================
   Purpose:
   1. Standardize RCDA logo.
   2. Load published content from Supabase.
   3. Prevent homepage CMS content from briefly showing
      stale static content during CMS loading.
   4. Preserve the existing page layouts.
   ========================================================= */

(function () {
    "use strict";

    const SUPABASE_URL =
        "https://ttuiljvtnfimzcgqogme.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_nZYzfjOw8p5eVX_44n3rcw_ioi-IGXA";

    const RCDA_LOGO = "rcda-logo.png";

    const currentPath =
        window.location.pathname.toLowerCase();

    const isHomePage =
        currentPath.endsWith("/") ||
        currentPath.endsWith("/index.html") ||
        currentPath === "";


    /* =========================================================
       1. CMS LOADING STATE
       ========================================================= */

    function activateCmsLoadingState() {

        if (!isHomePage) {
            return;
        }

        /*
         * Immediately add a class to <html>.
         * This allows the page to hide CMS-managed content
         * until the published version has been retrieved.
         */
        document.documentElement.classList.add(
            "rcda-cms-loading"
        );


        if (
            !document.getElementById(
                "rcda-cms-loading-style"
            )
        ) {

            const style =
                document.createElement("style");

            style.id =
                "rcda-cms-loading-style";

            style.textContent = `
                html.rcda-cms-loading
                .hero-content h1,

                html.rcda-cms-loading
                .hero-content p,

                html.rcda-cms-loading
                .founder-message {
                    visibility: hidden;
                }

                html.rcda-cms-ready
                .hero-content h1,

                html.rcda-cms-ready
                .hero-content p,

                html.rcda-cms-ready
                .founder-message {
                    visibility: visible;
                }
            `;

            document.head.appendChild(style);
        }
    }


    function finishCmsLoadingState() {

        if (!isHomePage) {
            return;
        }

        document.documentElement.classList.remove(
            "rcda-cms-loading"
        );

        document.documentElement.classList.add(
            "rcda-cms-ready"
        );
    }


    /*
     * Execute as early as possible.
     */
    activateCmsLoadingState();


    /* =========================================================
       2. STANDARDIZE RCDA LOGO
       ========================================================= */

    function standardizeLogo() {

        document.querySelectorAll(
            "header .logo"
        ).forEach(function (logo) {

            const existingImage =
                logo.querySelector("img");

            if (existingImage) {

                existingImage.src =
                    RCDA_LOGO;

                existingImage.alt =
                    "Rahama Community Development Association (RCDA) logo";

                existingImage.classList.add(
                    "rcda-global-logo"
                );

                return;
            }


            /*
             * Older logo structures.
             */
            const oldEmblem =
                logo.querySelector(".logo-emblem") ||
                logo.querySelector(".logo-box");

            if (oldEmblem) {

                const img =
                    document.createElement("img");

                img.src =
                    RCDA_LOGO;

                img.alt =
                    "Rahama Community Development Association (RCDA) logo";

                img.className =
                    "rcda-global-logo";

                logo.innerHTML = "";

                logo.appendChild(img);
            }

        });


        /*
         * Consistent logo dimensions.
         */
        if (
            !document.getElementById(
                "rcda-logo-global-style"
            )
        ) {

            const style =
                document.createElement("style");

            style.id =
                "rcda-logo-global-style";

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
       3. DETERMINE CMS PAGE KEY
       ========================================================= */

    function getPageKey() {

        let filename =
            window.location.pathname
                .split("/")
                .pop();

        if (
            !filename ||
            filename === "/"
        ) {
            filename = "index.html";
        }

        if (
            filename.toLowerCase() ===
            "index.html"
        ) {
            return "home";
        }

        return filename.replace(
            /\.html$/i,
            ""
        );
    }


    /* =========================================================
       4. LOAD SUPABASE LIBRARY
       ========================================================= */

    function loadSupabase(callback) {

        if (
            window.supabase &&
            typeof window.supabase.createClient ===
                "function"
        ) {
            callback();
            return;
        }


        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.async = true;


        script.onload = callback;


        script.onerror = function () {

            console.error(
                "RCDA CMS: Unable to load Supabase."
            );

            /*
             * Don't leave the homepage permanently hidden
             * if the external library fails.
             */
            finishCmsLoadingState();
        };


        document.head.appendChild(script);
    }


    /* =========================================================
       5. FIND CMS TARGETS
       ========================================================= */

    function getCmsTargets(pageKey) {

        const targets = {
            title: null,
            subtitle: null,
            content: null,
            image: null
        };


        /*
         * Explicit CMS hooks.
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


        /* -----------------------------------------------------
           HOMEPAGE FALLBACKS
           ----------------------------------------------------- */

        if (
            pageKey === "home"
        ) {

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


        /* -----------------------------------------------------
           INNER PAGE FALLBACKS
           ----------------------------------------------------- */

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


        return targets;
    }


    /* =========================================================
       6. WRITE CMS CONTENT
       ========================================================= */

    function setText(
        element,
        value
    ) {

        if (
            !element ||
            !value
        ) {
            return;
        }

        element.textContent =
            value;
    }


    function setHtmlContent(
        element,
        value
    ) {

        if (
            !element ||
            !value
        ) {
            return;
        }

        element.innerHTML =
            String(value).replace(
                /\n/g,
                "<br>"
            );
    }


    function setImage(
        element,
        url
    ) {

        if (
            !element ||
            !url
        ) {
            return;
        }


        if (
            element.tagName ===
            "IMG"
        ) {

            element.src =
                url;

            return;
        }


        element.style.backgroundImage =
            `url("${String(url)
                .replace(/"/g, '\\"')}")`;
    }


    /* =========================================================
       7. LOAD PUBLISHED CONTENT
       ========================================================= */

    async function loadPublishedContent() {

        if (
            !window.supabase ||
            typeof window.supabase.createClient !==
                "function"
        ) {

            finishCmsLoadingState();

            return;
        }


        const pageKey =
            getPageKey();

        const targets =
            getCmsTargets(pageKey);


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


            if (
                result.error
            ) {

                console.error(
                    "RCDA CMS error:",
                    result.error
                );

                finishCmsLoadingState();

                return;
            }


            const data =
                result.data;


            /*
             * If no CMS record exists, reveal the existing
             * static content rather than leaving it hidden.
             */
            if (!data) {

                finishCmsLoadingState();

                return;
            }


            /* -------------------------------------------------
               TITLE
               ------------------------------------------------- */

            if (
                targets.title &&
                data.title
            ) {

                setText(
                    targets.title,
                    data.title
                );
            }


            /* -------------------------------------------------
               SUBTITLE
               ------------------------------------------------- */

            if (
                targets.subtitle &&
                data.subtitle
            ) {

                setText(
                    targets.subtitle,
                    data.subtitle
                );
            }


            /* -------------------------------------------------
               MAIN CONTENT
               ------------------------------------------------- */

            if (
                targets.content &&
                data.content
            ) {

                setHtmlContent(
                    targets.content,
                    data.content
                );
            }


            /* -------------------------------------------------
               FEATURED IMAGE
               ------------------------------------------------- */

            if (
                targets.image &&
                data.image_url
            ) {

                setImage(
                    targets.image,
                    data.image_url
                );
            }


            /* -------------------------------------------------
               BROWSER TITLE
               ------------------------------------------------- */

            if (
                pageKey === "home" &&
                data.title
            ) {

                document.title =
                    data.title +
                    " | Rahama Community Development Association (RCDA)";
            }


            console.info(
                "RCDA CMS loaded:",
                pageKey
            );

        }

        catch (error) {

            console.error(
                "RCDA CMS unexpected error:",
                error
            );

        }

        finally {

            finishCmsLoadingState();
        }
    }


    /* =========================================================
       8. INITIALIZE
       ========================================================= */

    function initialize() {

        /*
         * Logo works independently of Supabase.
         */

        standardizeLogo();


        /*
         * CMS loading.
         */

        loadSupabase(
            function () {
                loadPublishedContent();
            }
        );
    }


    /* =========================================================
       9. START
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }

})();
