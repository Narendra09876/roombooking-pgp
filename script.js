// Rooms data - fixed 5 rooms with details
const roomsData = [
  {
    id: 201,
    title: "VIP Room 201",
    type: "VIP",
    price: 7500,
    image: "./image/images.jpg",
    amenities: ["WiFi", "Air Conditioning", "Breakfast", "City View"],
    availability: [] // booked dates (YYYY-MM-DD)
  },
  {
    id: 202,
    title: "VIP Room 202",
    type: "VIP",
    price: 7200,
    image: "./image/images1.jpg",
    amenities: ["WiFi", "TV", "Breakfast", "Jacuzzi"],
    availability: []
  },
  {
    id: 203,
    title: "Normal Room 203",
    type: "Normal",
    price: 3500,
    image: "./image/images2.jpg",
    amenities: ["WiFi", "TV", "Fan"],
    availability: []
  },
  {
    id: 204,
    title: "Normal Room 204",
    type: "Normal",
    price: 3000,
    image: "./image/images3.jpg",
    amenities: ["WiFi", "Air Conditioning"],
    availability: []
  },
  {
    id: 205,
    title: "Normal Room 205",
    type: "Normal",
    price: 3200,
    image: "./image/images4.jpg",
    amenities: ["WiFi", "TV"],
    availability: []
  }
];

// Load saved bookings from localStorage
let bookings = JSON.parse(localStorage.getItem("hotelstay_bookings")) || [];

// Initialize modal with Bootstrap
const bookingModal = new bootstrap.Modal(document.getElementById("bookingModal"));
const bookingForm = document.getElementById("bookingForm");
const bookingRoomIdInput = document.getElementById("bookingRoomId");
const guestNameInput = document.getElementById("guestName");
const bookingDateInput = document.getElementById("bookingDate");
const availabilityMsg = document.getElementById("availabilityMsg");

function saveBookings() {
  localStorage.setItem("hotelstay_bookings", JSON.stringify(bookings));
}

function renderRooms() {
  const container = document.getElementById("roomList");
  container.innerHTML = "";

  roomsData.forEach(room => {
    // Calculate booked dates for this room from bookings
    const bookedDates = bookings
      .filter(b => b.roomId === room.id)
      .map(b => b.date);

    room.availability = bookedDates;

    const amenitiesHtml = room.amenities
      .map(a => `<span class="badge ${room.type === "VIP" ? "vip-badge" : "normal-badge"} me-1">${a}</span>`)
      .join("");

    // Show if room is available today or booked
    const today = new Date().toISOString().split("T")[0];
    const isBookedToday = bookedDates.includes(today);
    const availabilityText = isBookedToday ? "Booked Today" : "Available";

    const availabilityClass = isBookedToday ? "text-danger" : "text-success";

    const typeIcon = room.type === "VIP"
      ? `<i class="fa-solid fa-crown text-warning me-2"></i>`
      : `<i class="fa-solid fa-bed text-primary me-2"></i>`;

    const card = document.createElement("div");
    card.className = "col-md-4";
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${room.image}" class="card-img-top" alt="${room.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${typeIcon} ${room.title}</h5>
          <p><strong>₹${room.price} / night</strong></p>
          <div class="mb-3">${amenitiesHtml}</div>
          <p class="availability ${availabilityClass} fw-semibold">${availabilityText}</p>
          <button class="btn btn-book mt-auto" ${isBookedToday ? "disabled" : ""} onclick="openBooking(${room.id})">
            Book Now
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderBookings() {
  const bookingList = document.getElementById("bookingList");
  const noBookings = document.getElementById("noBookings");

  if (bookings.length === 0) {
    bookingList.innerHTML = "";
    noBookings.style.display = "block";
    return;
  }

  noBookings.style.display = "none";
  bookingList.innerHTML = "";

  bookings.forEach(b => {
    const room = roomsData.find(r => r.id === b.roomId);
    if (!room) return;

    const item = document.createElement("div");
    item.className = "list-group-item d-flex justify-content-between align-items-center";
    item.innerHTML = `
      <div>
        <strong>${b.guestName}</strong> booked <strong>${room.title}</strong> on <em>${b.date}</em>
      </div>
      <button class="btn btn-sm btn-danger" onclick="cancelBooking('${b.id}')">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    bookingList.appendChild(item);
  });
}

function openBooking(roomId) {
  bookingRoomIdInput.value = roomId;
  guestNameInput.value = "";
  bookingDateInput.value = "";
  availabilityMsg.textContent = "";
  bookingDateInput.min = new Date().toISOString().split("T")[0]; // today or later
  bookingModal.show();
}

// Check availability on date change
bookingDateInput.addEventListener("change", () => {
  availabilityMsg.textContent = "";
  const roomId = parseInt(bookingRoomIdInput.value);
  const selectedDate = bookingDateInput.value;

  if (!selectedDate) return;

  // Check if already booked
  const conflict = bookings.some(b => b.roomId === roomId && b.date === selectedDate);
  if (conflict) {
    availabilityMsg.textContent = "Sorry, room already booked on this date.";
    bookingDateInput.setCustomValidity("Room booked on this date");
  } else {
    bookingDateInput.setCustomValidity("");
  }
});

// Handle booking form submit
bookingForm.addEventListener("submit", e => {
  e.preventDefault();

  const roomId = parseInt(bookingRoomIdInput.value);
  const guestName = guestNameInput.value.trim();
  const date = bookingDateInput.value;

  if (!guestName || !date) return;

  // Check again if date is available
  const conflict = bookings.some(b => b.roomId === roomId && b.date === date);
  if (conflict) {
    availabilityMsg.textContent = "Room already booked on this date.";
    return;
  }

  // Save booking
  const booking = {
    id: crypto.randomUUID(),
    roomId,
    guestName,
    date
  };
  bookings.push(booking);
  saveBookings();
  bookingModal.hide();
  renderRooms();
  renderBookings();
  alert("Booking confirmed! Thank you.");
});

// Cancel booking
function cancelBooking(id) {
  if (!confirm("Are you sure you want to cancel this booking?")) return;
  bookings = bookings.filter(b => b.id !== id);
  saveBookings();
  renderRooms();
  renderBookings();
}

// Day/Night Mode Toggle
const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  modeToggle.innerHTML = isDark
    ? '<i class="fa-solid fa-moon"></i>'
    : '<i class="fa-solid fa-sun"></i>';
});

// Initial Render
renderRooms();
renderBookings();