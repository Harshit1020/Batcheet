const nodemailer = require("nodemailer");
const googleApis = require("googleapis");
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = `269108972258-9658btcfj69vvidmnq6894rocjoho6si.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04Z3jLtcU3t1PCgYIARAAGAQSNwF-L9IrcpQ-cgBN5ky-rLnQFw5zbpftAZ7ZvQ2brXG7Ge3bH011-OrnHP6tq3tI2jCPNiUfvvo`;
const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET,
REDIRECT_URI);
authClient.setCredentials({refresh_token: REFRESH_TOKEN});
async function mailer(email,otp,userid){
 try{
 const ACCESS_TOKEN = await authClient.getAccessToken();
 const transport = nodemailer.createTransport({
 service: "gmail",
 auth: {
 type: "OAuth2",
 user: "harshitdongre043@gmail.com",
 clientId: CLIENT_ID,
 clientSecret: CLIENT_SECRET,
 refreshToken: REFRESH_TOKEN,
 accessToken: ACCESS_TOKEN
 }
 })
 const details = {
    from: "Harshit Dongre <harshitdongre043@gmail.com>",
    to: email,
    subject: "Hey Its Nodmailer",
    text: `otp`,
    html: `<a href="http://localhost:3000/forgot/${userid}/otp/${otp}">REset Password !</a>`
}
const result = await transport.sendMail(details);
return result;
 }
 catch(err){
 return err;
 }
}

mailer().then(res => {
 console.log("sent mail !", res);
})
module.exports = mailer ;