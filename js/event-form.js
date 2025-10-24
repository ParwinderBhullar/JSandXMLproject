// js/event-form.js

// Get the stored token from sessionStorage (from your login/auth)
const token = sessionStorage.getItem("access_token");

// Redirect back to login if token missing
if (!token) {
  alert("Session expired. Please sign in again.");
  window.location.href = "../index.html";
}

// Handle the form submission
document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent form reload

  // Collect values from form inputs
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  // Basic validation
  if (!title || !start || !end) {
    alert("Please fill out all required fields.");
    return;
  }

  // Build event object
  const event = {
    summary: title,
    description: description || "",
    start: {
      dateTime: new Date(start).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // auto detect user's timezone
    },
    end: {
      dateTime: new Date(end).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    // Send to Google Calendar API
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    const data = await response.json();

    // Check if created successfully
    if (data.id) {
      alert("Event created successfully!");
      console.log("Event created:", data);

      // Redirect back to dashboard
      window.location.href = "./dashboard.html";
    } else {
      console.error("Failed to create event:", data);
      alert("Failed to create event. Check console for details.");
    }
  } catch (error) {
    console.error("Error creating event:", error);
    alert("An error occurred while creating the event.");
  }
});

// Handle logout
document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("access_token");
  window.location.href = "../index.html";
});
