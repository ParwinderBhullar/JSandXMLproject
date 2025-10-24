// js/dashboard.js

async function initDashboard() {
  const token = sessionStorage.getItem("access_token");

  // Redirect if not signed in
  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  // Load GAPI client
  await new Promise((resolve) => {
    gapi.load("client", async () => {
      await gapi.client.init({
        apiKey: GOOGLE_CONFIG.API_KEY,
        discoveryDocs: [GOOGLE_CONFIG.DISCOVERY_DOC],
      });
      resolve();
    });
  });

  // Set token for authenticated requests
  gapi.client.setToken({ access_token: token });

  // 🟩 Load events from all calendars instead of just one
  loadEventsFromAllCalendars();

  // Handle logout
  document.getElementById("signout-btn").addEventListener("click", handleSignOut);
  
  document.getElementById("createevent-btn").addEventListener("click", createNewEvent);

}

// 🟩 New function: load events from all calendars
async function loadEventsFromAllCalendars() {
  const eventList = document.getElementById("eventList");
  eventList.innerHTML = "<li>Loading your events...</li>";

  try {
    // Get all calendars user has access to
    const calendarListResponse = await gapi.client.calendar.calendarList.list();
    const calendars = calendarListResponse.result.items || [];

    eventList.innerHTML = "";

    for (const calendar of calendars) {
      // Fetch next few events from each calendar
      const eventsResponse = await gapi.client.calendar.events.list({
        calendarId: calendar.id,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10, // show up to 3 from each calendar
        orderBy: "startTime",
      });

      const events = eventsResponse.result.items || [];
      if (events.length === 0) continue;

      // Calendar name heading
      const calendarTitle = document.createElement("li");
      calendarTitle.innerHTML = `<strong>📅 ${calendar.summary}</strong>`;
      calendarTitle.style.marginTop = "1rem";
      calendarTitle.style.fontSize = "1rem";
      eventList.appendChild(calendarTitle);

      // Events under this calendar
      for (const event of events) {
        const li = document.createElement("li");
        const start = event.start.dateTime
          ? new Date(event.start.dateTime).toLocaleString()
          : event.start.date;
        const location = event.location ? `<span>📍 ${event.location}</span>` : "";
        const description = event.description
          ? `<span>📝 ${event.description}</span>`
          : "";

        li.innerHTML = `
          <strong>${event.summary || "Untitled Event"}</strong>
          <span>🕒 ${start}</span>
          ${location}
          ${description}
        `;
        eventList.appendChild(li);
      }
    }

    if (eventList.innerHTML.trim() === "") {
      eventList.innerHTML = "<li>No upcoming events found.</li>";
    }
  } catch (err) {
    console.error("Error loading events:", err);
    eventList.innerHTML = `<li>Error loading events: ${err.message}</li>`;
  }
}

function handleSignOut() {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    google.accounts.oauth2.revoke(token, () => {
      sessionStorage.removeItem("access_token");
      window.location.href = "../index.html";
    });
  } else {
    window.location.href = "../index.html";
  }
}

function createNewEvent(){
  window.location.href = "newEvent.html";
}

window.onload = initDashboard;
