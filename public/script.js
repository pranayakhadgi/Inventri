const API_BASE = '';

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        btn.classList.add('active');
        loadTabData(tabName);
    });
});

async function loadTabData(tabName) {
    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'inventory') loadInventory();
    if (tabName === 'reservations') loadReservations();
    if (tabName === 'returns') loadReturnsTab();
    if (tabName === 'discrepancies') loadDiscrepancies();
}

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        const [items, reservations, discrepancies] = await Promise.all([
            fetch(`${API_BASE}/items`).then(r => r.json()),
            fetch(`${API_BASE}/reservations`).then(r => r.json()),
            fetch(`${API_BASE}/discrepancies`).then(r => r.json())
        ]);

        document.getElementById('total-items').textContent = items.count || 0;
        document.getElementById('active-reservations').textContent = reservations.data.filter(r => r.status === 'active').length;
        document.getElementById('open-discrepancies').textContent = discrepancies.flagged || 0;
        document.getElementById('resolved-count').textContent = discrepancies.resolved || 0;

        // Activity feed
        const recentItems = [
            ...discrepancies.data.slice(0, 2).map(d => ({
                time: new Date(d.reported_at).toLocaleDateString(),
                text: `Discrepancy flagged: ${d.type} on item ${d.item_name}`
            })),
            ...reservations.data.slice(0, 2).map(r => ({
                time: new Date(r.start_time).toLocaleDateString(),
                text: `Reservation created: ${r.organization_name}`
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        const feed = document.getElementById('activity-feed');
        feed.innerHTML = recentItems.length > 0
            ? recentItems.map(item => `
                <div class="activity-item">
                    <div>${item.text}</div>
                    <div class="activity-time">${item.time}</div>
                </div>
            `).join('')
            : '<p style="color: #94a3b8;">No recent activity</p>';
    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

// ===== INVENTORY =====
async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/items`);
        const data = await response.json();

        const tbody = document.getElementById('inventory-body');
        tbody.innerHTML = data.data.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.category || '-'}</td>
                <td>${item.location_name || '-'}</td>
                <td><span class="status ${item.status}">${item.status}</span></td>
            </tr>
        `).join('');

        document.getElementById('loading-inventory').style.display = 'none';
        document.getElementById('inventory-table').style.display = 'table';
    } catch (err) {
        console.error('Inventory error:', err);
        showToast('Failed to load inventory', 'error');
    }
}

// ===== RESERVATIONS =====
async function loadReservations() {
    try {
        const [orgsRes, itemsRes, reservationsRes] = await Promise.all([
            fetch(`${API_BASE}/organizations`).then(r => r.json()),
            fetch(`${API_BASE}/items`).then(r => r.json()),
            fetch(`${API_BASE}/reservations`).then(r => r.json())
        ]);

        // Populate org select
        const orgSelect = document.getElementById('org-select');
        orgSelect.innerHTML = '<option value="">Select Organization</option>' + orgsRes.data.map(org => `
            <option value="${org.organization_id}">${org.name}</option>
        `).join('');

        // Populate items checkboxes
        const itemsCheckboxes = document.getElementById('items-checkboxes');
        itemsCheckboxes.innerHTML = itemsRes.data.map(item => `
            <div class="checkbox-item">
                <input type="checkbox" id="item-${item.item_id}" value="${item.item_id}" name="item">
                <label for="item-${item.item_id}">${item.name}</label>
            </div>
        `).join('');

        // Populate reservations table
        const tbody = document.getElementById('reservations-body');
        tbody.innerHTML = reservationsRes.data.map(res => `
            <tr>
                <td>${res.reservation_id}</td>
                <td>${res.organization_name}</td>
                <td>${res.location_name || '-'}</td>
                <td>${new Date(res.start_time).toLocaleDateString()}</td>
                <td>${new Date(res.end_time).toLocaleDateString()}</td>
                <td><span class="status ${res.status}">${res.status}</span></td>
                <td><button class="btn btn-secondary btn-small" onclick="viewReservation(${res.reservation_id})">View</button></td>
            </tr>
        `).join('');

        document.getElementById('loading-reservations').style.display = 'none';
        document.getElementById('reservations-table').style.display = 'table';
    } catch (err) {
        console.error('Reservations error:', err);
        showToast('Failed to load reservations', 'error');
    }
}

// New reservation form
document.getElementById('new-res-btn').addEventListener('click', () => {
    document.getElementById('new-res-form').style.display = 'block';
});

document.getElementById('cancel-res-btn').addEventListener('click', () => {
    document.getElementById('new-res-form').style.display = 'none';
    document.getElementById('reservation-form').reset();
});

document.getElementById('reservation-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const orgId = document.getElementById('org-select').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const selectedItems = Array.from(document.querySelectorAll('input[name="item"]:checked')).map(cb => ({
        item_id: parseInt(cb.value),
        quantity_requested: 1
    }));

    if (!orgId || !startTime || !endTime || selectedItems.length === 0) {
        showToast('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organization_id: parseInt(orgId),
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString(),
                items: selectedItems
            })
        });

        if (response.ok) {
            showToast('Reservation created!', 'success');
            document.getElementById('new-res-form').style.display = 'none';
            document.getElementById('reservation-form').reset();
            loadReservations();
        } else {
            showToast('Failed to create reservation', 'error');
        }
    } catch (err) {
        console.error('Submission error:', err);
        showToast('Error creating reservation', 'error');
    }
});

async function viewReservation(reservationId) {
    try {
        const response = await fetch(`${API_BASE}/reservations/${reservationId}`);
        const data = await response.json();
        alert(`Reservation ${reservationId}\nOrganization: ${data.reservation.organization_name}\nItems: ${data.items.map(i => i.item_name).join(', ')}`);
    } catch (err) {
        showToast('Failed to load reservation details', 'error');
    }
}

// ===== RETURNS =====
async function loadReturnsTab() {
    try {
        const response = await fetch(`${API_BASE}/reservations`);
        const data = await response.json();

        const select = document.getElementById('return-res-select');
        select.innerHTML = '<option value="">Choose a reservation...</option>' + data.data
            .filter(r => r.status !== 'completed')
            .map(r => `<option value="${r.reservation_id}">${r.reservation_id} - ${r.organization_name}</option>`)
            .join('');

        select.addEventListener('change', () => loadReturnForm(select.value));
    } catch (err) {
        showToast('Failed to load returns', 'error');
    }
}

async function loadReturnForm(reservationId) {
    if (!reservationId) {
        document.getElementById('return-form-container').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reservations/${reservationId}`);
        const data = await response.json();

        const itemsList = document.getElementById('return-items-list');
        itemsList.innerHTML = data.items.map(item => `
            <div class="return-item">
                <div class="return-item-name">${item.item_name}</div>
                <div class="return-item-qty">
                    <div class="return-item-qty-input">
                        <label>Requested:</label>
                        <input type="number" value="${item.quantity_requested}" disabled>
                    </div>
                    <div class="return-item-qty-input">
                        <label>Returned:</label>
                        <input type="number" id="return-${item.reservation_item_id}" min="0" max="${item.quantity_requested}" value="0">
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('return-form-container').style.display = 'block';

        document.getElementById('submit-return-btn').onclick = () => submitReturn(reservationId, data.items);
    } catch (err) {
        showToast('Failed to load return form', 'error');
    }
}

async function submitReturn(reservationId, items) {
    const returnItems = items.map(item => ({
        reservation_item_id: item.reservation_item_id,
        quantity_returned: parseInt(document.getElementById(`return-${item.reservation_item_id}`).value) || 0
    }));

    try {
        const response = await fetch(`${API_BASE}/reservations/${reservationId}/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: returnItems })
        });

        if (response.ok) {
            const result = await response.json();
            showToast(result.discrepancies ? 'Return processed - discrepancies flagged!' : 'Return processed!', 'success');
            document.getElementById('return-res-select').value = '';
            document.getElementById('return-form-container').style.display = 'none';
            loadDiscrepancies();
        }
    } catch (err) {
        showToast('Error processing return', 'error');
    }
}

// ===== DISCREPANCIES =====
async function loadDiscrepancies() {
    try {
        const response = await fetch(`${API_BASE}/discrepancies`);
        const data = await response.json();

        document.getElementById('disc-total').textContent = data.count;
        document.getElementById('disc-flagged').textContent = data.flagged;
        document.getElementById('disc-resolved').textContent = data.resolved;

        const tbody = document.getElementById('discrepancies-body');
        tbody.innerHTML = data.data.map(disc => `
            <tr>
                <td>${disc.discrepancy_id}</td>
                <td>${disc.organization_name}</td>
                <td>${disc.item_name}</td>
                <td>${disc.type}</td>
                <td><span class="status ${disc.status}">${disc.status}</span></td>
                <td>${new Date(disc.reported_at).toLocaleDateString()}</td>
                <td>${disc.notes || '-'}</td>
                <td>
                    ${disc.status === 'flagged' ? `<button class="btn btn-success btn-small" onclick="resolveDiscrepancy(${disc.discrepancy_id})">Resolve</button>` : '—'}
                </td>
            </tr>
        `).join('');

        document.getElementById('loading-discrepancies').style.display = 'none';
        document.getElementById('discrepancies-table').style.display = 'table';
    } catch (err) {
        console.error('Discrepancies error:', err);
        showToast('Failed to load discrepancies', 'error');
    }
}

async function resolveDiscrepancy(discrepancyId) {
    try {
        const response = await fetch(`${API_BASE}/discrepancies/${discrepancyId}/resolve`, { method: 'PUT' });
        if (response.ok) {
            showToast('Discrepancy resolved!', 'success');
            loadDiscrepancies();
        }
    } catch (err) {
        showToast('Error resolving discrepancy', 'error');
    }
}

// CSV Download
document.getElementById('download-csv').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = `${API_BASE}/reports/csv`;
});

// Initial load
loadDashboard();