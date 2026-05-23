const API_BASE = '';

async function fetchApi(path) {
    const response = await fetch(`${API_BASE}${path}`);
    let body;
    try {
        body = await response.json();
    } catch (e) {
        body = { error: 'Invalid JSON response' };
    }
    const data = Array.isArray(body?.data) ? body.data : [];
    return { ok: response.ok, status: response.status, data, body, error: body?.error || (!response.ok ? `HTTP ${response.status}` : null) };
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

async function loadTabData(tabName) {
    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'inventory') loadInventory();
    if (tabName === 'reservations') loadReservations();
    if (tabName === 'returns') loadReturnsTab();
    if (tabName === 'discrepancies') loadDiscrepancies();
}

// ===== DASHBOARD =====
function pickInitialCalendarMonth(reservations) {
    if (!reservations.length) return;

    const countMatchesInMonth = (year, month) => {
        const parsed = reservations.map(res => ({
            parsedStart: new Date(res.start_time).setHours(0, 0, 0, 0),
            parsedEnd: res.end_time ? new Date(res.end_time).setHours(23, 59, 59, 999) : Infinity
        }));
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayStart = new Date(year, month, day).setHours(0, 0, 0, 0);
            if (parsed.some(res => dayStart >= res.parsedStart && dayStart <= res.parsedEnd)) {
                return true;
            }
        }
        return false;
    };

    if (countMatchesInMonth(calendarYear, calendarMonth)) return;

    const earliest = reservations.reduce((a, b) =>
        new Date(a.start_time) < new Date(b.start_time) ? a : b
    );
    const d = new Date(earliest.start_time);
    
    if (calendarMonth !== d.getMonth() || calendarYear !== d.getFullYear()) {
        showToast(`Jumped to ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()} for the earliest reservation.`, 'success');
    }
    
    calendarMonth = d.getMonth();
    calendarYear = d.getFullYear();
}

async function loadDashboard() {
    try {
        const [itemsApi, resApi, discApi] = await Promise.all([
            fetchApi('/items'),
            fetchApi('/reservations'),
            fetchApi('/discrepancies')
        ]);

        if (!resApi.ok) {
            showToast(resApi.error || 'Failed to load reservations', 'error');
        }

        const resData = resApi.data;
        const discData = discApi.data;

        pickInitialCalendarMonth(resData);
        renderCalendar(resData);

        // Activity feed
        const recentItems = [
            ...discData.slice(0, 3).map(d => ({
                rawTime: new Date(d.reported_at).getTime(),
                time: new Date(d.reported_at).toLocaleDateString(),
                text: d.status === 'resolved'
                    ? `✅ The discrepancy for the ${d.item_name} was resolved.`
                    : `⚠️ A discrepancy was flagged for the ${d.item_name}.`
            })),
            ...resData.slice(0, 3).map(r => ({
                rawTime: new Date(r.start_time).getTime(),
                time: new Date(r.start_time).toLocaleDateString(),
                text: r.status === 'completed'
                    ? `📦 ${r.organization_name} returned their items.`
                    : `📅 ${r.organization_name} created a new reservation.`
            }))
        ].sort((a, b) => b.rawTime - a.rawTime).slice(0, 5);

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
        const feed = document.getElementById('activity-feed');
        if (feed) feed.innerHTML = '<p style="color: #ef4444;">Failed to load dashboard data.</p>';
        const grid = document.getElementById('calendar-grid');
        if (grid) grid.innerHTML = '<p style="color: #ef4444; padding: 1rem;">Failed to load calendar.</p>';
    }
}

// ===== INVENTORY =====
async function loadInventory() {
    try {
        const itemsApi = await fetchApi('/items');

        if (!itemsApi.ok) {
            showToast(itemsApi.error || 'Failed to load inventory', 'error');
        }

        const container = document.getElementById('inventory-body');
        const items = itemsApi.data;

        // Group items by category
        const categorized = {};
        items.forEach(item => {
            const cat = item.category || 'Uncategorized';
            if (!categorized[cat]) categorized[cat] = [];
            categorized[cat].push(item);
        });

        let html = '';
        if (items.length === 0) {
            html = '<p style="color: #94a3b8; padding: 1rem;">No inventory items found.</p>';
        }
        for (const [category, categoryItems] of Object.entries(categorized)) {
            html += `<h3 class="category-title">${category}</h3>`;
            html += `<div class="inventory-grid">`;

            categoryItems.forEach(item => {
                let badgeClass = item.status === 'available' ? 'status-green' : (item.status === 'checked_out' ? 'status-amber' : 'status-red');
                let imgHtml = item.image_url
                    ? `<div class="card-image-wrapper"><img src="${item.image_url}" alt="${item.name}" class="inventory-card-image"></div>`
                    : `<div class="card-image-wrapper placeholder"><span style="font-size:2rem">📦</span></div>`;

                html += `
                    <div class="inventory-card">
                        ${imgHtml}
                        <div class="card-header">
                            <h4 class="item-name">${item.name}</h4>
                            <span class="status-badge ${badgeClass}">${item.status.replace('_', ' ')}</span>
                        </div>
                        <div class="card-body">
                            <div class="info-row">
                                <span class="info-label">Location:</span>
                                <span class="info-value">${item.location_name || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        container.innerHTML = html;

        document.getElementById('loading-inventory').style.display = 'none';
        document.getElementById('inventory-table').style.display = 'block';
    } catch (err) {
        console.error('Inventory error:', err);
        showToast('Failed to load inventory', 'error');
    }
}

// ===== ADD ITEM =====
document.getElementById('cancel-item-btn').addEventListener('click', () => {
    document.getElementById('new-item-form').style.display = 'none';
});

document.getElementById('submit-item-btn').addEventListener('click', async () => {
    const name = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value;
    const locationId = document.getElementById('item-location').value;
    const imageUrl = document.getElementById('item-image-url').value.trim();

    if (!name) {
        showToast('Item name is required', 'error');
        return;
    }

    try {
        const response = await fetch('/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                category: category || null,
                location_id: locationId ? parseInt(locationId) : null,
                image_url: imageUrl || null
            })
        });

        if (response.ok) {
            showToast('Item added!', 'success');
            document.getElementById('new-item-form').style.display = 'none';
            document.getElementById('add-item-form').reset();
            loadInventory();
        } else {
            const err = await response.json();
            showToast(err.error || 'Failed to add item', 'error');
        }
    } catch (err) {
        showToast('Error adding item', 'error');
    }
});

function provokeAnswer() {
    let userChoice = confirm("Do you want to delete this item?");

    if (userChoice) {
        showToast('Item deleted!', 'success');
        document.getElementById('remove-item-form').style.display = 'none';
        document.getElementById('add-item-form').reset();
        loadInventory();
    }
    else {
        showToast("Item not deleted", "error");
    }
}

document.getElementById('remove-item-btn').addEventListener('click', () => {
    document.getElementById('remove-item-form').style.display = 'block';
});

// ===== ORGANIZATIONS =====

document.getElementById('new-org-btn').addEventListener('click', () => {
    document.getElementById('new-org-form').style.display = 'block';
});

document.getElementById('cancel-org-btn').addEventListener('click', () => {
    document.getElementById('new-org-form').style.display = 'none';
});

document.getElementById('submit-org-btn').addEventListener('click', async () => {
    const name = document.getElementById('org-name').value.trim();
    const type = document.getElementById('org-type').value;
    const email = document.getElementById('org-email').value.trim();
    const icon = document.getElementById('org-icon').value;

    if (!name || !type) {
        showToast('Organization name and type are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/organizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                type: type || null,
                contact_email: email || null,
                icon: icon || '🏢'
            })
        });

        if (response.ok) {
            showToast('Organization added!', 'success');
            document.getElementById('new-org-form').style.display = 'none';
            document.getElementById('org-name').value = '';
            document.getElementById('org-type').value = '';
            document.getElementById('org-email').value = '';
            document.getElementById('org-icon').value = '🏢';
            loadReservations();
        } else {
            const err = await response.json();
            showToast(err.error || 'Failed to add organization', 'error');
        }
    } catch (err) {
        showToast('Error adding organization', 'error');
    }
});

// ===== LOCATIONS =====

document.getElementById('new-loc-btn').addEventListener('click', () => {
    document.getElementById('new-loc-form').style.display = 'block';
});

document.getElementById('cancel-loc-btn').addEventListener('click', () => {
    document.getElementById('new-loc-form').style.display = 'none';
});

document.getElementById('submit-loc-btn').addEventListener('click', async () => {
    const name = document.getElementById('loc-name').value.trim();
    const type = document.getElementById('loc-type').value;
    const address = document.getElementById('loc-address').value.trim();

    if (!name || !type) {
        showToast('Location name and type are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/locations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                type: type || null,
                address: address || null
            })
        });

        if (response.ok) {
            showToast('Location added!', 'success');
            document.getElementById('new-loc-form').style.display = 'none';
            document.getElementById('loc-name').value = '';
            document.getElementById('loc-type').value = '';
            document.getElementById('loc-address').value = '';
            loadReservations();
        } else {
            const err = await response.json();
            showToast(err.error || 'Failed to add location', 'error');
        }
    } catch (err) {
        showToast('Error adding location', 'error');
    }
});

// ===== RESERVATIONS =====
async function loadReservations() {
    try {
        const [orgsApi, itemsApi, locsApi, resApi] = await Promise.all([
            fetchApi('/organizations'),
            fetchApi('/items'),
            fetchApi('/locations'),
            fetchApi('/reservations')
        ]);

        const orgData = orgsApi.data;
        const itemData = itemsApi.data;
        const locData = locsApi.data;
        const resData = resApi.data;

        if (!itemsApi.ok) showToast(itemsApi.error || 'Failed to load items', 'error');
        if (!orgsApi.ok) showToast(orgsApi.error || 'Failed to load organizations', 'error');

        // Populate org select
        const orgSelect = document.getElementById('org-select');
        orgSelect.innerHTML = '<option value="">Select Organization</option>' + orgData.map(org => `
            <option value="${org.organization_id}">${org.name}</option>
        `).join('');

        // Populate items checkboxes
        const itemsCheckboxes = document.getElementById('items-checkboxes');
        itemsCheckboxes.innerHTML = itemData.length === 0
            ? '<p style="color: #94a3b8;">No items available. Add items in Inventory or check API connection.</p>'
            : itemData.map(item => {
                const available = item.status === 'available';
                return `
            <div class="checkbox-item ${available ? '' : 'unavailable'}">
                <input type="checkbox" 
                    id="item-${item.item_id}" 
                    value="${item.item_id}" 
                    name="item" 
                    ${available ? '' : 'disabled'} />
                <label for="item-${item.item_id}">
                    ${item.name}
                    <span class="item-status-tag ${item.status}">
                        ${item.status}
                    </span>
                </label>
            </div>
        `}).join('');

        // Populate locations select
        const locationSelect = document.getElementById('location-select');
        locationSelect.innerHTML = '<option value="">Select Location</option>'
            + locData.map(loc => `
            <option value="${loc.location_id}">${loc.name} (${loc.type})
            </option>
            `).join('');

        // Populate reservations table
        const tbody = document.getElementById('reservations-body');
        tbody.innerHTML = resData.map(res => `
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
    const locationId = document.getElementById('location-select').value;
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

    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start < now) {
        showToast('Start date cannot be in the past', 'error');
        return;
    }

    if (end <= start) {
        showToast('End date must be after start date', 'error');
        return;
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    maxDate.setHours(23, 59, 59, 999); // Avoid timezone/hour/second overbounding

    if (start > maxDate) {
        showToast('Start date cannot be more than 2 years in the future', 'error');
        return;
    }

    if (end > maxDate) {
        showToast('End date cannot be more than 2 years in the future', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organization_id: parseInt(orgId),
                location_id: parseInt(locationId),
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
            loadInventory(); // Auto-refresh inventory tab so it matches reservations
        } else {
            const errData = await response.json();
            const errMsg = errData.details
                ? errData.details.map(d => d.message).join(', ')
                : (errData.error || 'Failed to create reservation');
            showToast(errMsg, 'error');
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
        const res = data.reservation;
        const details = document.getElementById('view-res-details');

        const itemsHtml = data.items.map(item => {
            const discBadge = item.discrepancy_id
                ? `<span class="status flagged" style="margin-left: 0.5rem;">${item.discrepancy_status || 'flagged'}</span>`
                : '';
            return `
                <tr>
                    <td>${escapeHtml(item.item_name)}</td>
                    <td>${escapeHtml(item.category || '-')}</td>
                    <td>${item.quantity_requested}</td>
                    <td>${item.quantity_returned}</td>
                    <td>${discBadge}</td>
                </tr>
            `;
        }).join('');

        details.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <p><strong>Organization:</strong> ${escapeHtml(res.organization_name)}</p>
                <p><strong>Location:</strong> ${escapeHtml(res.location_name || 'N/A')}</p>
                <p><strong>Status:</strong> <span class="status ${res.status}">${res.status}</span></p>
                <p><strong>Start:</strong> ${new Date(res.start_time).toLocaleString()}</p>
                <p><strong>End:</strong> ${new Date(res.end_time).toLocaleString()}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">Item</th>
                        <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">Category</th>
                        <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">Requested</th>
                        <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">Returned</th>
                        <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">Discrepancy</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
        `;
        openModal('view-res-modal');
    } catch (err) {
        showToast('Failed to load reservation details', 'error');
    }
}

// ===== RETURNS =====
async function loadReturnsTab() {
    try {
        const resApi = await fetchApi('/reservations');

        if (!resApi.ok) {
            showToast(resApi.error || 'Failed to load returns', 'error');
        }

        const select = document.getElementById('return-res-select');
        const pending = resApi.data.filter(r => r.status !== 'completed');
        select.innerHTML = '<option value="">Choose a reservation...</option>' + (
            pending.length === 0
                ? ''
                : pending.map(r => `<option value="${r.reservation_id}">${r.reservation_id} - ${escapeHtml(r.organization_name)}</option>`).join('')
        );

        select.onchange = () => loadReturnForm(select.value);
    } catch (err) {
        console.error('Returns error:', err);
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
            loadInventory(); // Keep inventory statuses in sync after returns
            loadReservations(); // Keep reservations updated after returns
        }
    } catch (err) {
        showToast('Error processing return', 'error');
    }
}

// ===== DISCREPANCIES =====
let cachedDiscrepancies = [];

async function loadDiscrepancies() {
    try {
        const discApi = await fetchApi('/discrepancies');

        if (!discApi.ok) {
            showToast(discApi.error || 'Failed to load discrepancies', 'error');
        }

        const meta = discApi.body || {};
        document.getElementById('disc-total').textContent = meta.count ?? 0;
        document.getElementById('disc-flagged').textContent = meta.flagged ?? 0;
        document.getElementById('disc-resolved').textContent = meta.resolved ?? 0;

        cachedDiscrepancies = discApi.data;
        const tbody = document.getElementById('discrepancies-body');
        tbody.innerHTML = discApi.data.length === 0
            ? '<tr><td colspan="9" style="text-align:center;color:#94a3b8;">No discrepancies found</td></tr>'
            : discApi.data.map(disc => {
                const resolutionCol = disc.status === 'resolved'
                    ? `${escapeHtml(disc.resolution_type || '-')}<br><small>${disc.resolved_at ? new Date(disc.resolved_at).toLocaleDateString() : ''}</small>`
                    : '—';
                const actionCol = disc.status === 'flagged'
                    ? `<button class="btn btn-success btn-small resolve-disc-btn" data-id="${disc.discrepancy_id}">Resolve</button>`
                    : '—';
                return `
            <tr>
                <td>${disc.discrepancy_id}</td>
                <td>${escapeHtml(disc.organization_name)}</td>
                <td>${escapeHtml(disc.item_name)}</td>
                <td>${escapeHtml(disc.type)}</td>
                <td><span class="status ${disc.status}">${disc.status}</span></td>
                <td>${new Date(disc.reported_at).toLocaleDateString()}</td>
                <td>${escapeHtml(disc.notes || '-')}</td>
                <td>${resolutionCol}</td>
                <td>${actionCol}</td>
            </tr>
        `;
            }).join('');

        document.getElementById('loading-discrepancies').style.display = 'none';
        document.getElementById('discrepancies-table').style.display = 'table';
    } catch (err) {
        console.error('Discrepancies error:', err);
        showToast('Failed to load discrepancies', 'error');
    }
}

function openResolvePanel(discrepancyId, itemName, orgName) {
    document.getElementById('resolve-disc-id').value = discrepancyId;
    document.getElementById('resolve-disc-details').innerHTML = `
        <p style="margin: 0; color: #475569;"><strong>Item:</strong> ${escapeHtml(itemName)}</p>
        ${orgName ? `<p style="margin: 0.25rem 0 0; color: #475569;"><strong>Organization:</strong> ${escapeHtml(orgName)}</p>` : ''}
    `;
    document.getElementById('resolve-type').value = '';
    document.getElementById('resolve-notes').value = '';
    updateResolveConsequence('');
    openModal('resolve-disc-modal');
}

function updateResolveConsequence(value) {
    const preview = document.getElementById('resolve-consequence');
    if (!preview) return;

    if (!value) {
        preview.style.display = 'none';
        return;
    }

    preview.style.display = 'block';

    if (value === 'returned' || value === 'false-alarm') {
        preview.style.background = '#064e3b';
        preview.style.color = '#34d399';
        preview.style.border = '1px solid #10b981';
        preview.textContent = 'Available Action: Item status will be reset to "available" immediately.';
    } else if (value === 'lost' || value === 'damaged') {
        preview.style.background = '#450a0a';
        preview.style.color = '#fca5a5';
        preview.style.border = '1px solid #ef4444';
        preview.textContent = 'Maintenance Action: Item status will be set to "maintenance". It will remain locked from future reservations.';
    }
}

async function submitResolveDiscrepancy() {
    const discrepancyId = document.getElementById('resolve-disc-id').value;
    const resolutionType = document.getElementById('resolve-type').value;
    const resolutionNotes = document.getElementById('resolve-notes').value.trim();

    if (!resolutionType || !resolutionNotes) {
        showToast('Please fill out all resolution fields.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/discrepancies/${discrepancyId}/resolve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolutionType, resolutionNotes })
        });

        if (response.ok) {
            showToast('Discrepancy successfully resolved!', 'success');
            closeModal('resolve-disc-modal');
            loadDiscrepancies();
            loadInventory();
            loadReservations();
            loadDashboard();
        } else {
            const err = await response.json();
            showToast(err.error || 'Failed to resolve discrepancy', 'error');
        }
    } catch (err) {
        showToast('Error connecting to server', 'error');
    }
}

// ==== CALENDAR LOGIC ====
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CAL_MIN_YEAR = 2025;
const CAL_MAX_YEAR = 2027;

const ORG_COLORS = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Emerald green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#84cc16', // Lime
    '#d946ef', // Fuchsia
    '#06b6d4'  // Cyan
];
const assignedOrgColors = new Map();

function getOrgColor(orgName) {
    if (!orgName) return '#1b1464';
    if (assignedOrgColors.has(orgName)) {
        return assignedOrgColors.get(orgName);
    }
    // Assign the next available color from the palette
    const colorIndex = assignedOrgColors.size % ORG_COLORS.length;
    const color = ORG_COLORS[colorIndex];
    assignedOrgColors.set(orgName, color);
    return color;
}

let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();
let cachedReservations = [];

function updateCalendarLabel() {
    const label = document.getElementById('cal-month-label');
    if (label) label.textContent = `${MONTH_NAMES[calendarMonth]} ${calendarYear}`;
}

function canGoPrev() {
    return !(calendarYear === CAL_MIN_YEAR && calendarMonth === 0);
}

function canGoNext() {
    return !(calendarYear === CAL_MAX_YEAR && calendarMonth === 11);
}

function renderCalendar(reservations) {
    cachedReservations = reservations || [];
    const grid = document.getElementById('calendar-grid');
    const tooltip = document.getElementById('calendar-tooltip');
    if (!grid) return;

    const safeReservations = Array.isArray(reservations) ? reservations : [];

    grid.innerHTML = '';
    updateCalendarLabel();

    // Disable nav buttons at boundaries
    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    if (prevBtn) prevBtn.disabled = !canGoPrev();
    if (nextBtn) nextBtn.disabled = !canGoNext();

    const year = calendarYear;
    const month = calendarMonth;
    const today = new Date();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

    // Add empty offset cells for alignment
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        grid.appendChild(emptyDiv);
    }

    // Collect unique orgs for legend
    const legendOrgs = new Map();
    safeReservations.forEach(res => {
        if (res.organization_name) {
            legendOrgs.set(res.organization_name, getOrgColor(res.organization_name));
        }
    });

    // Optimize: Pre-parse reservation dates outside the loop
    const parsedReservations = safeReservations.map(res => ({
        ...res,
        parsedStart: new Date(res.start_time).setHours(0, 0, 0, 0),
        parsedEnd: res.end_time ? new Date(res.end_time).setHours(23, 59, 59, 999) : Infinity
    }));

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        // Check if today
        if (currentDate.toDateString() === today.toDateString()) {
            dayDiv.classList.add('today');
        }

        // Day number
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayDiv.appendChild(dayNumber);

        // Find reservations for this day
        const dayStart = currentDate.setHours(0, 0, 0, 0);
        const dayReservations = parsedReservations.filter(res => {
            return dayStart >= res.parsedStart && dayStart <= res.parsedEnd;
        });
        if (dayReservations.length > 0) {
            dayDiv.classList.add('has-reservation');

            // Add color bars (max 3 visible)
            const barsDiv = document.createElement('div');
            barsDiv.className = 'day-bars';

            const maxBars = 3;
            const visibleRes = dayReservations.slice(0, maxBars);
            visibleRes.forEach(res => {
                const bar = document.createElement('div');
                bar.className = 'day-bar';
                bar.style.backgroundColor = getOrgColor(res.organization_name);
                bar.textContent = res.organization_name;
                barsDiv.appendChild(bar);
            });

            if (dayReservations.length > maxBars) {
                const moreSpan = document.createElement('div');
                moreSpan.className = 'day-more-tag';
                moreSpan.textContent = `+${dayReservations.length - maxBars} more`;
                barsDiv.appendChild(moreSpan);
            }
            dayDiv.appendChild(barsDiv);

            // Tooltip on hover
            dayDiv.addEventListener('mouseenter', (e) => {
                const dateString = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                const maxVisible = 3;
                const visibleReservations = dayReservations.slice(0, maxVisible);
                const hiddenCount = dayReservations.length - maxVisible;

                let tooltipHtml = `
                    <div style="font-weight: 700; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; color: #1b1464; font-size: 0.9rem;">
                        📅 ${dateString}
                    </div>
                `;

                tooltipHtml += visibleReservations.map(res => {
                    let badgeColor = '#1b1464';
                    if (res.status === 'completed') badgeColor = '#10b981';
                    if (res.status === 'pending') badgeColor = '#e3000f';
                    const icon = res.organization_icon || '🏢';

                    return `
                        <div style="margin-bottom: 10px; font-size: 0.8rem; line-height: 1.3;">
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                                <span style="font-weight: 600; color: #3e3c90; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">
                                    ${icon} ${res.organization_name}
                                </span>
                                <span style="background: ${badgeColor}22; color: ${badgeColor}; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">
                                    ${res.status}
                                </span>
                            </div>
                            <div style="color: #64748b; margin-top: 2px; font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;">
                                📦 ${res.item_names || 'No items'}
                            </div>
                        </div>
                    `;
                }).join('');

                if (hiddenCount > 0) {
                    tooltipHtml += `
                        <div style="text-align: center; color: #94a3b8; font-size: 0.75rem; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px; font-style: italic;">
                            + ${hiddenCount} more reservation${hiddenCount > 1 ? 's' : ''}
                        </div>
                    `;
                }

                tooltip.innerHTML = tooltipHtml;
                tooltip.style.display = 'block';
                tooltip.style.left = `${e.clientX + 15}px`;
                tooltip.style.top = `${e.clientY + 15}px`;
            });

            dayDiv.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });

            dayDiv.addEventListener('mousemove', (e) => {
                tooltip.style.left = `${e.clientX + 15}px`;
                tooltip.style.top = `${e.clientY + 15}px`;
            });

            // Click to open Daily Manifest Modal
            dayDiv.addEventListener('click', () => {
                openManifestModal(currentDate, dayReservations);
            });
        }
        grid.appendChild(dayDiv);
    }

    // Render Organization Legend
    renderLegend(legendOrgs);
}

function renderLegend(legendOrgs) {
    const legendContainer = document.getElementById('org-legend');
    if (!legendContainer) return;

    if (legendOrgs.size === 0) {
        legendContainer.innerHTML = '<span style="color: #64748b; font-size: 0.8rem;">No reservations this month</span>';
        return;
    }

    legendContainer.innerHTML = '';
    legendOrgs.forEach((color, name) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-color-box" style="background-color: ${color}; width: 12px; height: 12px; border-radius: 3px; display: inline-block;"></span><span class="legend-name">${name}</span>`;
        legendContainer.appendChild(item);
    });
}

// ==== EMOJI RANDOMIZER ====
const EMOJI_CATEGORIES = [
    // Faces & People
    '😀', '😂', '😎', '🤓', '🤠', '👽', '👻', '🤖', '👾',
    // Animals
    '🐶', '🐱', '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔',
    // Nature
    '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷',
    // Sports & Activities
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴'
];

// ==== DAILY MANIFEST MODAL ====
function openManifestModal(date, reservations) {
    const title = document.getElementById('manifest-title');
    const body = document.getElementById('manifest-details');

    title.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    body.innerHTML = reservations.length === 0
        ? '<p style="color: #64748b;">No reservations for this day.</p>'
        : reservations.map(res => {
            let badgeColor = '#1b1464';
            if (res.status === 'completed') badgeColor = '#10b981';
            if (res.status === 'pending') badgeColor = '#e3000f';

            const startTime = new Date(res.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(res.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `
            <div class="manifest-card" style="border-left: 4px solid ${getOrgColor(res.organization_name)};">
                <div class="manifest-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div class="manifest-org">
                        <div style="font-size: 1.1rem; font-weight: 700; color: #1e293b;">${res.organization_name}</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
                            <span style="font-weight: 500;">📍 ${res.location_name || 'N/A'}</span> • 
                            <span>⏰ ${startTime} - ${endTime}</span>
                        </div>
                    </div>
                    <span class="manifest-status" style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}; border-radius: 9999px; padding: 4px 10px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${res.status}
                    </span>
                </div>
                <div class="manifest-items" style="padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.9rem; color: #334155; line-height: 1.5;">
                    <div style="color: #0f172a; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Reserved Equipment</div>
                    ${res.item_names || 'No items listed'}
                </div>
            </div>
        `;
        }).join('');

    openModal('manifest-modal');
}

function initApp() {
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

    // Discrepancies: event delegation for Resolve buttons
    document.getElementById('discrepancies-body').addEventListener('click', (e) => {
        const btn = e.target.closest('.resolve-disc-btn');
        if (!btn) return;
        const disc = cachedDiscrepancies.find(d => String(d.discrepancy_id) === btn.dataset.id);
        if (!disc) return;
        openResolvePanel(disc.discrepancy_id, disc.item_name, disc.organization_name);
    });

    // Resolve discrepancy modal
    document.getElementById('resolve-type').addEventListener('change', (e) => {
        updateResolveConsequence(e.target.value);
    });
    document.getElementById('confirm-resolve-btn').addEventListener('click', submitResolveDiscrepancy);
    document.getElementById('close-resolve-disc').addEventListener('click', () => closeModal('resolve-disc-modal'));
    document.getElementById('resolve-disc-modal').addEventListener('click', (e) => {
        if (e.target.id === 'resolve-disc-modal') closeModal('resolve-disc-modal');
    });

    // View reservation modal
    document.getElementById('close-view-res').addEventListener('click', () => closeModal('view-res-modal'));
    document.getElementById('view-res-modal').addEventListener('click', (e) => {
        if (e.target.id === 'view-res-modal') closeModal('view-res-modal');
    });

    // Daily manifest modal
    document.getElementById('close-manifest-modal').addEventListener('click', () => closeModal('manifest-modal'));
    document.getElementById('manifest-modal').addEventListener('click', (e) => {
        if (e.target.id === 'manifest-modal') closeModal('manifest-modal');
    });

    // CSV download
    document.getElementById('download-csv').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `${API_BASE}/reports/csv`;
    });

    // Calendar navigation
    document.getElementById('cal-prev').addEventListener('click', () => {
        if (!canGoPrev()) return;
        calendarMonth--;
        if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
        renderCalendar(cachedReservations);
    });
    document.getElementById('cal-next').addEventListener('click', () => {
        if (!canGoNext()) return;
        calendarMonth++;
        if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
        renderCalendar(cachedReservations);
    });

    // Emoji randomizer
    const randomizeBtn = document.getElementById('randomize-icon-btn');
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', () => {
            const emojis = ['🏢', '🎓', '🏫', '📚', '⚽', '🎭', '🎨', '🔬', '💼', '🌍'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            document.getElementById('org-icon').value = randomEmoji;
        });
    }

    document.getElementById('new-item-btn').addEventListener('click', () => {
        // Populate location dropdown from already-fetched data
        fetch('/locations').then(r => r.json()).then(data => {
            const select = document.getElementById('item-location');
            select.innerHTML = '<option value="">Select Location</option>'
                + data.data.map(l => `
                <option value="${l.location_id}">${l.name}</option>
            `).join('');
        });
        document.getElementById('new-item-form').style.display = 'block';
    });

    document.getElementById('upload-trigger-btn').addEventListener('click', () => {
        document.getElementById('item-image-file').click();
    });

    document.getElementById('item-image-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const status = document.getElementById('upload-status');
        status.textContent = 'Uploading...';
        status.style.color = '#60a5fa';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'frontend_upload');

        try {
            const response = await fetch(
                'https://api.cloudinary.com/v1_1/dptqomarh/image/upload',
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (data.secure_url) {
                document.getElementById('item-image-url').value = data.secure_url;
                document.getElementById('preview-img').src = data.secure_url;
                document.getElementById('upload-preview').style.display = 'block';

                status.textContent = 'Photo uploaded';
                status.style.color = '#10b981';
            } else {
                status.textContent = 'Upload failed';
                status.style.color = '#f44453';
            }
        } catch (err) {
            status.textContent = 'Upload failed';
            status.style.color = '#f44453';
        }
    });

    const removeBtn = document.getElementById('remove-item-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', async () => {
            const select = document.getElementById('remove-item-select');
            select.innerHTML = '<option value="">Loading items...</option>';
            document.getElementById('remove-item-form').style.display = 'block';

            try {
                const itemsApi = await fetchApi('/items');
                if (itemsApi.ok) {
                    select.innerHTML = '<option value="">Choose an item...</option>'
                        + itemsApi.data.map(item => `
                            <option value="${item.item_id}">${escapeHtml(item.name)} (${escapeHtml(item.category || 'Uncategorized')}) - ${escapeHtml(item.status)}</option>
                        `).join('');
                } else {
                    select.innerHTML = '<option value="">Failed to load items</option>';
                    showToast('Failed to load items for deletion', 'error');
                }
            } catch (err) {
                select.innerHTML = '<option value="">Error loading items</option>';
            }
        });
    }

    const cancelDeleteBtn = document.getElementById('cancel-delete');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            document.getElementById('remove-item-form').style.display = 'none';
            document.getElementById('remove-item-select').value = '';
        });
    }

    const confirmDeleteBtn = document.getElementById('confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            const select = document.getElementById('remove-item-select');
            const itemId = select.value;

            if (!itemId) {
                showToast('Please select an item to remove', 'error');
                return;
            }

            const itemName = select.options[select.selectedIndex].text;
            const confirmChoice = confirm(`Are you sure you want to permanently remove "${itemName}"?`);
            if (!confirmChoice) return;

            try {
                const response = await fetch(`/items/${itemId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                if (response.ok) {
                    showToast('Item deleted successfully!', 'success');
                    document.getElementById('remove-item-form').style.display = 'none';
                    select.value = '';
                    loadInventory();
                } else {
                    showToast(data.error || 'Failed to delete item', 'error');
                }
            } catch (err) {
                showToast('Error deleting item', 'error');
            }
        });
    }

    loadDashboard();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}