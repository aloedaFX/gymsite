const STORAGE_KEYS = {
  bookings: 'primefit_bookings',
  members: 'primefit_members',
};

function dom(id) {
  return document.getElementById(id);
}

function getLocalData(key) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function formatCurrency(amount) {
  return `₦${amount.toLocaleString()}`;
}

function countAvailableSlots() {
  const bookings = getLocalData(STORAGE_KEYS.bookings);
  const today = new Date().toISOString().split('T')[0];
  const bookedToday = bookings.filter((booking) => booking.date === today).length;
  const totalSlots = 4;
  return Math.max(totalSlots - bookedToday, 0);
}

function calculateRevenue() {
  const bookings = getLocalData(STORAGE_KEYS.bookings);
  const members = getLocalData(STORAGE_KEYS.members);
  const bookingRevenue = bookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
  const memberRevenue = members.reduce((sum, member) => sum + (member.amount || 0), 0);
  return bookingRevenue + memberRevenue;
}

function getActiveMembers() {
  const members = getLocalData(STORAGE_KEYS.members);
  const today = new Date().toISOString().split('T')[0];
  return members.filter((member) => member.expiryDate >= today).length;
}

function renderDashboardStats() {
  dom('totalBookings').textContent = getLocalData(STORAGE_KEYS.bookings).length;
  dom('activeMembers').textContent = getActiveMembers();
  dom('totalRevenue').textContent = formatCurrency(calculateRevenue());
  dom('availableSlots').textContent = countAvailableSlots();
}

function updateBookingStatus(id, status) {
  const bookings = getLocalData(STORAGE_KEYS.bookings);
  const updated = bookings.map((booking) => {
    if (booking.id === id) {
      return { ...booking, status };
    }
    return booking;
  });
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(updated));
  renderBookingRows();
  renderDashboardStats();
}

function deleteBooking(id) {
  const bookings = getLocalData(STORAGE_KEYS.bookings).filter((booking) => booking.id !== id);
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
  renderBookingRows();
  renderDashboardStats();
}

function deleteMember(id) {
  const members = getLocalData(STORAGE_KEYS.members).filter((member) => member.id !== id);
  localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(members));
  renderMemberRows();
  renderDashboardStats();
}

function editMember(id) {
  const members = getLocalData(STORAGE_KEYS.members);
  const member = members.find((member) => member.id === id);
  if (!member) return;
  const newPlan = prompt('Update membership plan:', member.plan);
  if (newPlan) {
    member.plan = newPlan;
    member.expiryDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(members));
    renderMemberRows();
    renderDashboardStats();
  }
}

function renderBookingRows() {
  const bookings = getLocalData(STORAGE_KEYS.bookings);
  dom('bookingTableBody').innerHTML = bookings.map((booking) => `
    <tr>
      <td>${booking.name}</td>
      <td>${booking.date}</td>
      <td>${booking.slot}</td>
      <td>${formatCurrency(booking.price)}</td>
      <td>${booking.status}</td>
      <td class="action-buttons">
        <button class="button button-outline" onclick="updateBookingStatus('${booking.id}', 'Confirmed')">Approve</button>
        <button class="button button-outline" onclick="updateBookingStatus('${booking.id}', 'Canceled')">Cancel</button>
        <button class="button button-outline" onclick="deleteBooking('${booking.id}')">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6">No bookings available. Use the main site to create demo bookings.</td></tr>';
}

function renderMemberRows() {
  const members = getLocalData(STORAGE_KEYS.members);
  dom('memberTableBody').innerHTML = members.map((member) => `
    <tr>
      <td>${member.name}</td>
      <td>${member.plan}</td>
      <td>${member.paymentStatus}</td>
      <td>${member.expiryDate}</td>
      <td class="action-buttons">
        <button class="button button-outline" onclick="editMember('${member.id}')">Edit</button>
        <button class="button button-outline" onclick="deleteMember('${member.id}')">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5">No active members yet. New registrations appear here automatically.</td></tr>';
}

window.updateBookingStatus = updateBookingStatus;
window.deleteBooking = deleteBooking;
window.deleteMember = deleteMember;
window.editMember = editMember;

window.addEventListener('load', () => {
  renderDashboardStats();
  renderBookingRows();
  renderMemberRows();
});
