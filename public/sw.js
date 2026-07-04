self.addEventListener("install", () => {
    console.log("SW installed");
});

self.addEventListener("fetch", () => {});

self.addEventListener(
"push",
event=>{

    const data =
    event.data.json();

    event.waitUntil(

        self.registration
        .showNotification(

            data.title,

            {
                body:
                data.body,

                icon:
                "/images/logo.png",

                badge:
                "/images/logo.png"
            }

        )

    );

});