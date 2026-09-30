/* =========================================================
   RCDA GLOBAL SITE SCRIPT
   ========================================================= */

(function () {
    "use strict";

    const SUPABASE_URL =
        "https://ttuiljvtnfimzcgqogme.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_nZYzfjOw8p5eVX_44n3rcw_ioi-IGXA";

    const RCDA_LOGO = "rcda-logo.png";

    /* -------------------------------------------------------
       STANDARDIZE RCDA LOGO
       ------------------------------------------------------- */

    function standardizeLogo() {

        document.querySelectorAll("header .logo").forEach(function (logo) {

            /* Existing image logo */
            const existingImage = logo.querySelector("img");

            if (existingImage) {
                existingImage.src = RCDA_LOGO;
                existingImage.alt =
                    "Rahama Community Development Association (RCDA) logo";

                existingImage.classList.add("rcda-global-logo");
                return;
            }

            /* Old circular R placeholder */
            const oldEmblem =
                logo.querySelector(".logo-emblem");

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


        /* ---------------------------------------------------
           STANDARD LOGO SIZE
           --------------------------------------------------- */

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


    /* -------------------------------------------------------
       DETERMINE CURRENT PAGE
       ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       LOAD SUPABASE
       ------------------------------------------------------- */

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
                "RCDA CMS: Supabase library could not be loaded."
            );
        };

        document.head.appendChild(script);
    }


    /* -------------------------------------------------------
       FIND CMS TARGETS
       ------------------------------------------------------- */

    function getCmsTargets(pageKey) {

        if (pageKey === "home") {

            return {

                title:
                    document.querySelector(
                        '[data-cms="home-title"]'
                    ) ||
                    document.querySelector(
                        ".hero-content h1"
                    ),

                subtitle:
                    document.querySelector(
                        '[data-cms="home-subtitle"]'
                    ) ||
                    document.querySelector(
                        ".hero-content p"
                    ),

                content:
                    document.querySelector(
                        '[data-cms="home-content"]'
                    ) ||
                    document.querySelector(
                        ".founder-message"
                    ),

                image:
                    document.querySelector(
                        '[data-cms="home-image"]'
                    ) ||
                    document.querySelector(
                        ".hero-image"
                    )
            };
        }

        return {

            title:
                document.querySelector(
                    `[data-cms="${pageKey}-title"]`
                ) ||
                document.querySelector(
                    ".page-hero h1"
                ),

            subtitle:
                document.querySelector(
                    `[data-cms="${pageKey}-subtitle"]`
                ) ||
                document.querySelector(
                    ".page-hero p"
                ),

            content:
                document.querySelector(
                    `[data-cms="${pageKey}-content"]`
                ) ||
                null,

            image:
                document.querySelector(
                    `[data-cms="${pageKey}-image"]`
                ) ||
                null
        };
    }


    /* -------------------------------------------------------
       LOAD PUBLISHED CONTENT
       ------------------------------------------------------- */

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
                    .eq("page_key", pageKey)
                    .eq("status", "published")
                    .maybeSingle();

            if (result.error) {

                console.error(
                    "RCDA CMS error:",
                    result.error
                );

                return;
            }

            const data = result.data;

            if (!data) {
                return;
            }


            /* Page title */

            if (
                targets.title &&
                data.title
            ) {
                targets.title.textContent =
                    data.title;
            }


            /* Page subtitle */

            if (
                targets.subtitle &&
                data.subtitle
            ) {
                targets.subtitle.textContent =
                    data.subtitle;
            }


            /* CMS content */

            if (
                targets.content &&
                data.content
            ) {
                targets.content.innerHTML =
                    data.content.replace(
                        /\n/g,
                        "<br>"
                    );
            }


            /* CMS image */

            if (
                targets.image &&
                data.image_url
            ) {

                if (
                    targets.image.tagName === "IMG"
                ) {

                    targets.image.src =
                        data.image_url;

                } else {

                    targets.image.style.backgroundImage =
                        `url("${data.image_url}")`;
                }
            }


            /* Browser title */

            if (
                data.title &&
                pageKey === "home"
            ) {

                document.title =
                    data.title +
                    " | Rahama Community Development Association (RCDA)";
            }

        }

        catch (error) {

            console.error(
                "RCDA CMS unexpected error:",
                error
            );
        }
    }


    /* -------------------------------------------------------
       INITIALIZE
       ------------------------------------------------------- */

    function initialize() {

        /* Logo works independently of Supabase */
        standardizeLogo();

        /* CMS loading happens separately */
        loadSupabase(function () {

            loadPublishedContent();

        });
    }


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
