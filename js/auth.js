// js/auth.js

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById("signin-btn").onclick = handleAuthClick;

function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: GOOGLE_CONFIG.API_KEY,
    discoveryDocs: [GOOGLE_CONFIG.DISCOVERY_DOC],
  });
  gapiInited = true;
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    scope: GOOGLE_CONFIG.SCOPES,
    callback: "",
  });
  gisInited = true;
}

function handleAuthClick() {
  if (!gapiInited || !gisInited) {
    alert("Google API not initialized yet. Please wait a second.");
    return;
  }

  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) throw resp;

    console.log("Successfully signed in!");

    // Save the access token in sessionStorage for use on dashboard
    sessionStorage.setItem("access_token", resp.access_token);

    // Redirect to dashboard
    window.location.href = "./webpages/dashboard.html";
  };

  tokenClient.requestAccessToken({ prompt: "consent" });
}

window.onload = function () {
  gapiLoaded();
  gisLoaded();
};
