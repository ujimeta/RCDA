/* =========================================================
   RCDA GLOBAL SITE SCRIPT — CMS v5
   =========================================================
   CMS v5 adds:
   - published page title/subtitle loading
   - published featured image loading
   - structured section rendering from site_content.sections
   - safe fallback to existing static HTML
   - homepage content-flash prevention
   - official RCDA logo normalization
   ========================================================= */

(function () {
    "use strict";

    const SUPABASE_URL =
        "https://ttuiljvtnfimzcgqogme.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_nZYzfjOw8p5eVX_44n3rcw_ioi-IGXA";

    const RCDA_LOGO = "rcda-logo.png";

    const path =
        window.location.pathname.toLowerCase();

    const isHomePage =
        path === "" ||
        path.endsWith("/") ||
        path.endsWith("/index.html");


    /* =========================================================
       HOMEPAGE CMS LOADING STATE
       ========================================================= */

    function startHomeLoadingState() {

        if (!isHomePage) {
            return;
        }

        document.documentElement.classList.add(
            "rcda-cms-loading"
        );

        if (!document.getElementById("rcda-cms-loading-style")) {

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


    function finishHomeLoadingState() {

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


    startHomeLoadingState();


    /* =========================================================
       GLOBAL LOGO
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


        if (!document.getElementById("rcda-logo-global-style")) {

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
       PAGE KEY
       ========================================================= */

    function getPageKey() {

        let filename =
            window.location.pathname
                .split("/")
                .pop();

        if (!filename || filename === "/") {
            filename = "index.html";
        }

        if (filename.toLowerCase() === "index.html") {
            return "home";
        }

        return filename.replace(
            /\.html$/i,
            ""
        );
    }


    /* =========================================================
       SUPABASE LOADER
       ========================================================= */

    function loadSupabase(callback) {

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {
            callback();
            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.async = true;

        script.onload =
            callback;

        script.onerror =
            function () {

                console.error(
                    "RCDA CMS: Unable to load Supabase."
                );

                finishHomeLoadingState();
            };

        document.head.appendChild(script);
    }


    /* =========================================================
       CMS TARGETS
       ========================================================= */

    function getTargets(pageKey) {

        const targets = {
            title: null,
            subtitle: null,
            content: null,
            image: null,
            sections: null
        };


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

        targets.sections =
            document.querySelector(
                `[data-cms-sections="${pageKey}"]`
            );


        /* Homepage fallbacks */

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
        }


        /* Existing inner-page fallbacks */

        targets.title =
            targets.title ||
            document.querySelector(
                ".page-header h1"
            ) ||
            document.querySelector(
                ".page-content h1"
            );

        targets.subtitle =
            targets.subtitle ||
            document.querySelector(
                ".page-header p"
            ) ||
            document.querySelector(
                ".page-content > p"
            );


        return targets;
    }


    /* =========================================================
       WRITERS
       ========================================================= */

    function setText(element, value) {

        if (!element || !value) {
            return;
        }

        element.textContent =
            value;
    }


    function setHtml(element, value) {

        if (!element || !value) {
            return;
        }

        element.innerHTML =
            String(value)
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .replace(
                    /\n/g,
                    "<br>"
                );
    }


    function setImage(element, url) {

        if (!element || !url) {
            return;
        }

        if (element.tagName === "IMG") {

            element.src =
                url;

            return;
        }

        element.style.backgroundImage =
            `url("${String(url).replace(/"/g, '\\"')}")`;
    }


    /* =========================================================
       STRUCTURED SECTIONS
       ========================================================= */

    function normalizeSections(value) {

        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .filter(function (section) {
                return (
                    section &&
                    typeof section === "object"
                );
            })
            .map(function (section, index) {

                return {
                    heading:
                        typeof section.heading === "string"
                            ? section.heading.trim()
                            : "",

                    content:
                        typeof section.content === "string"
                            ? section.content.trim()
                            : "",

                    order:
                        Number.isFinite(
                            Number(section.order)
                        )
                            ? Number(section.order)
                            : index + 1
                };
            })
            .filter(function (section) {
                return (
                    section.heading ||
                    section.content
                );
            })
            .sort(function (a, b) {
                return a.order - b.order;
            });
    }


    function ensureSectionStyles() {

        if (
            document.getElementById(
                "rcda-generated-sections-style"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "rcda-generated-sections-style";

        style.textContent = `
            .rcda-generated-sections {
                margin-top: 10px;
            }

            .rcda-generated-section {
                margin-top: 30px;
            }

            .rcda-generated-section:first-child {
                margin-top: 0;
            }

            .rcda-generated-section h2 {
                margin-top: 0;
            }

            .rcda-generated-section p {
                margin-bottom: 15px;
                white-space: normal;
            }
        `;

        document.head.appendChild(style);
    }


    function renderSections(
        mount,
        sections
    ) {

        if (!mount || !sections.length) {
            return false;
        }

        ensureSectionStyles();

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "rcda-generated-sections";


        sections.forEach(function (section) {

            const sectionElement =
                document.createElement("section");

            sectionElement.className =
                "rcda-generated-section";


            if (section.heading) {

                const heading =
                    document.createElement("h2");

                heading.textContent =
                    section.heading;

                sectionElement.appendChild(
                    heading
                );
            }


            if (section.content) {

                const paragraph =
                    document.createElement("p");

                paragraph.innerHTML =
                    section.content
                        .replace(/\r\n/g, "\n")
                        .replace(/\r/g, "\n")
                        .replace(/\n/g, "<br>");

                sectionElement.appendChild(
                    paragraph
                );
            }


            wrapper.appendChild(
                sectionElement
            );
        });


        mount.innerHTML = "";

        mount.appendChild(
            wrapper
        );

        return true;
    }


    /* =========================================================
       LOAD PUBLISHED CONTENT
       ========================================================= */

    async function loadPublishedContent() {

        const pageKey =
            getPageKey();

        try {

            if (
                !window.supabase ||
                typeof window.supabase.createClient !== "function"
            ) {
                finishHomeLoadingState();
                return;
            }


            const client =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_PUBLISHABLE_KEY
                );


            const result =
                await client
                    .from("site_content")
                    .select(
                        "page_key,title,subtitle,content,image_url,status,sections"
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


            const data =
                result.data;


            if (!data) {
                return;
            }


            const targets =
                getTargets(pageKey);


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


            /* MAIN CONTENT */

            if (
                targets.content &&
                data.content
            ) {

                setHtml(
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


            /* STRUCTURED SECTIONS */

            const structuredSections =
                normalizeSections(
                    data.sections
                );

            if (
                targets.sections &&
                structuredSections.length
            ) {

                renderSections(
                    targets.sections,
                    structuredSections
                );
            }


            /* BROWSER TITLE */

            if (
                pageKey === "home" &&
                data.title
            ) {

                document.title =
                    data.title +
                    " | Rahama Community Development Association (RCDA)";
            }


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

        finally {

            finishHomeLoadingState();
        }
    }


    /* =========================================================
       INITIALIZE
       ========================================================= */

    function initialize() {

        standardizeLogo();

        loadSupabase(
            function () {
                loadPublishedContent();
            }
        );
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
