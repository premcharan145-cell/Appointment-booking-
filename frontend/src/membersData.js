// Helpers for the lecturer ("Members") feature, now backed by the real DB.
// Lecturers are seeded as service_providers; the frontend fetches them from
// GET /api/providers and books via POST /api/appointments.

// The 10 lecturers ("Members") shown on the Members page. Rendered as static
// cards so they always appear regardless of the providers API; `id` matches the
// seeded provider's providerId so "Book Appointment" still posts to the backend.
// defaultStart/defaultEnd are the 24-hour times used to pre-fill the booking form.
export const MEMBERS = [
    { id: 1,  name: "Dr. Rajesh Kumar",    subject: "DBMS",                    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],    timeSlot: "10:00 AM - 12:00 PM", defaultStart: "10:00", defaultEnd: "12:00", login: "lecturer1@booking.com" },
    { id: 2,  name: "Prof. Anitha Reddy",  subject: "Operating Systems",       availableDays: ["Monday", "Wednesday", "Thursday", "Saturday"], timeSlot: "02:00 PM - 04:00 PM", defaultStart: "14:00", defaultEnd: "16:00", login: "lecturer2@booking.com" },
    { id: 3,  name: "Dr. Srinivas Rao",    subject: "Computer Networks",       availableDays: ["Tuesday", "Wednesday", "Friday", "Saturday"],  timeSlot: "09:00 AM - 11:00 AM", defaultStart: "09:00", defaultEnd: "11:00", login: "lecturer3@booking.com" },
    { id: 4,  name: "Prof. Kavitha Devi",  subject: "Data Structures",         availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],    timeSlot: "11:00 AM - 01:00 PM", defaultStart: "11:00", defaultEnd: "13:00", login: "lecturer4@booking.com" },
    { id: 5,  name: "Dr. Praveen Kumar",   subject: "Software Engineering",    availableDays: ["Tuesday", "Thursday", "Friday", "Saturday"],   timeSlot: "03:00 PM - 05:00 PM", defaultStart: "15:00", defaultEnd: "17:00", login: "lecturer5@booking.com" },
    { id: 6,  name: "Prof. Lakshmi Priya", subject: "Java Programming",        availableDays: ["Monday", "Wednesday", "Thursday", "Saturday"], timeSlot: "09:00 AM - 11:00 AM", defaultStart: "09:00", defaultEnd: "11:00", login: "lecturer6@booking.com" },
    { id: 7,  name: "Dr. Harish Chandra",  subject: "Artificial Intelligence", availableDays: ["Monday", "Tuesday", "Thursday", "Saturday"],   timeSlot: "01:00 PM - 03:00 PM", defaultStart: "13:00", defaultEnd: "15:00", login: "lecturer7@booking.com" },
    { id: 8,  name: "Prof. Suresh Babu",   subject: "Machine Learning",        availableDays: ["Wednesday", "Thursday", "Friday", "Saturday"], timeSlot: "10:00 AM - 12:00 PM", defaultStart: "10:00", defaultEnd: "12:00", login: "lecturer8@booking.com" },
    { id: 9,  name: "Dr. Meena Rani",      subject: "Cloud Computing",         availableDays: ["Monday", "Tuesday", "Friday", "Saturday"],     timeSlot: "02:00 PM - 04:00 PM", defaultStart: "14:00", defaultEnd: "16:00", login: "lecturer9@booking.com" },
    { id: 10, name: "Prof. Naveen Kumar",  subject: "Cyber Security",          availableDays: ["Monday", "Wednesday", "Thursday", "Friday"],   timeSlot: "11:00 AM - 01:00 PM", defaultStart: "11:00", defaultEnd: "13:00", login: "lecturer10@booking.com" },
];

// The 10 lecturer names (derived from MEMBERS). Used to filter the providers
// list when matching against the backend.
export const LECTURER_NAMES = new Set(MEMBERS.map((m) => m.name));

// Convert 24-hour "14:00" to 12-hour "02:00 PM"
export function to12(t) {
    const [h, m] = (t || "").split(":");
    let hh = parseInt(h, 10);
    if (isNaN(hh)) return t || "";
    const ap = hh >= 12 ? "PM" : "AM";
    hh = hh % 12;
    if (hh === 0) hh = 12;
    return `${String(hh).padStart(2, "0")}:${m || "00"} ${ap}`;
}

// From an availability JSON string {"Monday":"10:00-12:00", ...} derive the
// list of days and a single 12-hour time slot for the lecturer card.
export function availabilityToCard(availStr) {
    try {
        const parsed = JSON.parse(availStr);
        const days = Object.keys(parsed);
        let timeSlot = "";
        if (days.length) {
            const [s, e] = (parsed[days[0]] || "").split("-");
            timeSlot = `${to12(s)} - ${to12(e)}`;
        }
        return { days, timeSlot, defaultStart: days.length ? (parsed[days[0]].split("-")[0]) : "", defaultEnd: days.length ? (parsed[days[0]].split("-")[1]) : "" };
    } catch {
        return { days: [], timeSlot: availStr || "", defaultStart: "", defaultEnd: "" };
    }
}
