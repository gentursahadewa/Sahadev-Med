const webpush =
require("web-push");

webpush.setVapidDetails(

"mailto:gentur013@gmail.com",

process.env.VAPID_PUBLIC_KEY,

process.env.VAPID_PRIVATE_KEY

);

module.exports =
webpush;