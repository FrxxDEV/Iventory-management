document.addEventListener('DOMContentLoaded', function() {
    var wrapper = document.getElementById("wrapper");
    var toggleButton = document.getElementById("menu-toggle");

    function isMobile() { return window.innerWidth < 992; }

    function resetSidebarState() {
        if (!isMobile()) {
            wrapper.classList.remove("toggled");
        }
    }

    resetSidebarState();

    if (toggleButton) {
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            wrapper.classList.toggle("toggled");
        });
    }

    window.addEventListener('resize', resetSidebarState);
});

function closeSidebar() {
    document.getElementById("wrapper").classList.remove("toggled");
}

function closeSidebarOnMobile() {
    if (window.innerWidth < 992) closeSidebar();
}

let inventory = JSON.parse(localStorage.getItem('modernInventory')) || [];

function changeView(view) {
    ['nav-dashboard','nav-stock','nav-kasir','nav-rekap'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    ['mobile-nav-dashboard','mobile-nav-stock','mobile-nav-kasir','mobile-nav-rekap'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    const views = ['view-dashboard','view-stock','view-kasir','view-rekap'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    if (view === 'dashboard') {
        document.getElementById('view-dashboard').style.display = 'block';
        document.getElementById('nav-dashboard').classList.add('active');
        const mEl = document.getElementById('mobile-nav-dashboard');
        if (mEl) mEl.classList.add('active');
        document.getElementById('page-title').innerText = 'Dashboard';
        updateStats();
    } else if (view === 'stock') {
        document.getElementById('view-stock').style.display = 'block';
        document.getElementById('nav-stock').classList.add('active');
        const mEl = document.getElementById('mobile-nav-stock');
        if (mEl) mEl.classList.add('active');
        document.getElementById('page-title').innerText = 'Daftar Stok';
        renderAll();
        const searchInput = document.getElementById('tableSearchInput');
        if (searchInput) searchInput.value = '';
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) clearBtn.style.display = 'none';
    } else if (view === 'kasir') {
        document.getElementById('view-kasir').style.display = 'block';
        document.getElementById('nav-kasir').classList.add('active');
        const mEl = document.getElementById('mobile-nav-kasir');
        if (mEl) mEl.classList.add('active');
        document.getElementById('page-title').innerText = 'Kasir';
        renderKasirItems();
        renderCart();
    } else if (view === 'rekap') {
        document.getElementById('view-rekap').style.display = 'block';
        document.getElementById('nav-rekap').classList.add('active');
        const mEl = document.getElementById('mobile-nav-rekap');
        if (mEl) mEl.classList.add('active');
        document.getElementById('page-title').innerText = 'Rekap Penjualan';
        initRekap();
    }
}

function renderAll() {
    renderTable();
    renderMobileCards();
    updateStats();
    updateNotifications();
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    if (!tableBody) return;

    if (inventory.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tableBody.innerHTML = '';

    inventory.forEach((item, index) => {
        let stockClass = item.stock < 5 ? 'table-stock-low' : 'table-stock-normal';
        tableBody.innerHTML += `
            <tr class="fade-in inventory-row" data-item-name="${item.name.toLowerCase()}">
                <td class="table-row-number">${index + 1}</td>
                <td class="text-start table-item-name">${item.name}</td>
                <td><span class="${stockClass}">${item.stock} unit</span></td>
                <td><input type="number" id="qty-${index}" class="qty-input" value="1" min="1" inputmode="numeric"></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-stock-in" onclick="updateStock(${index}, 'in')" title="Tambah stok"><i class="fas fa-plus fa-sm"></i></button>
                        <button class="btn-stock-out" onclick="updateStock(${index}, 'out')" title="Kurangi stok"><i class="fas fa-minus fa-sm"></i></button>
                        <button class="btn-delete" onclick="deleteItem(${index})" title="Hapus barang"><i class="fas fa-trash fa-sm"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        setTimeout(() => searchTable(), 0);
    }
}

function renderMobileCards() {
    const container = document.getElementById('mobileStockCards');
    if (!container) return;

    if (inventory.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '';

    inventory.forEach((item, index) => {
        let stockClass = item.stock < 5 ? 'table-stock-low' : 'table-stock-normal';
        let cardHighlight = item.stock < 5 ? 'highlight' : '';

        container.innerHTML += `
            <div class="mobile-stock-card ${cardHighlight} inventory-row" data-item-name="${item.name.toLowerCase()}">
                <div class="mobile-card-header">
                    <span class="mobile-card-num">#${index + 1}</span>
                    <span class="mobile-card-name">${item.name}</span>
                </div>
                <div class="mobile-card-body">
                    <div class="mobile-card-stock-row">
                        <span class="mobile-card-stock-label">Stok Tersisa</span>
                        <span class="${stockClass}">${item.stock} unit</span>
                    </div>
                    <div class="mobile-card-actions">
                        <input type="number" id="mqty-${index}" class="mobile-qty-input" value="1" min="1" inputmode="numeric">
                        <div class="mobile-btn-group">
                            <button class="mobile-btn-in" onclick="event.stopPropagation();updateStock(${index}, 'in')">
                                <i class="fas fa-plus"></i> Masuk
                            </button>
                            <button class="mobile-btn-out" onclick="event.stopPropagation();updateStock(${index}, 'out')">
                                <i class="fas fa-minus"></i> Keluar
                            </button>
                        </div>
                        <button class="mobile-btn-delete" onclick="event.stopPropagation();deleteItem(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        setTimeout(() => searchTable(), 0);
    }
}

function updateStats() {
    let totalItems = inventory.length;
    let totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
    let lowStockItems = inventory.filter(item => item.stock < 5).length;

    let el1 = document.getElementById('statTotalItems');
    let el2 = document.getElementById('statTotalStock');
    let el3 = document.getElementById('statLowStock');
    if (el1) el1.innerText = totalItems;
    if (el2) el2.innerText = totalStock;
    if (el3) el3.innerText = lowStockItems;
}

let toastQueue = [];

function showNotification(message, type = 'success') {
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', out: '#f59e0b', low: '#ef4444' };

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 70px; right: 20px;
        min-width: 280px; max-width: 340px;
        background: ${colors[type] || colors.success}; color: white;
        padding: 14px 18px; border-radius: 12px; z-index: 10000;
        font-weight: 600; font-size: 0.92rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        display: flex; align-items: center; gap: 8px;
        transition: top 0.3s ease, opacity 0.3s ease; opacity: 0;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    toastQueue.push(toast);
    repositionToasts();
    requestAnimationFrame(() => { toast.style.opacity = '1'; });

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
            toastQueue = toastQueue.filter(t => t !== toast);
            repositionToasts();
        }, 300);
    }, 2800);
}

function repositionToasts() {
    const gap = 10;
    const baseTop = 70;
    let currentTop = baseTop;
    toastQueue.forEach(toast => {
        toast.style.top = currentTop + 'px';
        toast.style.bottom = 'auto';
        currentTop += toast.offsetHeight + gap;
    });
}

function addNewItem() {
    let nameInput = document.getElementById('newItemName').value.trim();
    let stockInput = parseInt(document.getElementById('newItemStock').value);
    let priceInput = parseInt(document.getElementById('newItemPrice')?.value || '0') || 0;

    if (nameInput === '' || isNaN(stockInput) || stockInput < 0) {
        showNotification('Lengkapi semua field dengan benar!', 'error');
        return;
    }

    inventory.push({ name: nameInput, stock: stockInput, price: priceInput });
    saveData();

    document.getElementById('newItemName').value = '';
    document.getElementById('newItemStock').value = '';
    if (document.getElementById('newItemPrice')) document.getElementById('newItemPrice').value = '';

    showNotification(` "${nameInput}" ditambahkan!`, 'success');
}

function updateStock(index, action) {
    let mobileQtyEl = document.getElementById(`mqty-${index}`);
    let desktopQtyEl = document.getElementById(`qty-${index}`);
    let qtyEl = (mobileQtyEl && document.activeElement === mobileQtyEl) ? mobileQtyEl : (desktopQtyEl || mobileQtyEl);
    if (!qtyEl) return;

    let qty = parseInt(qtyEl.value);

    if (isNaN(qty) || qty <= 0) {
        showNotification('Jumlah harus angka positif!', 'error');
        return;
    }

    if (action === 'in') {
        inventory[index].stock += qty;
        showNotification(` +${qty} "${inventory[index].name}"`, 'success');
    } else if (action === 'out') {
        if (qty > inventory[index].stock) {
            showNotification(` Stok tidak cukup! Sisa ${inventory[index].stock} unit`, 'error');
            return;
        }
        inventory[index].stock -= qty;
        checkLowStockWarning(inventory[index].name, inventory[index].stock);
        showNotification(` -${qty} "${inventory[index].name}"`, 'out');
    }

    if (mobileQtyEl) mobileQtyEl.value = '1';
    if (desktopQtyEl) desktopQtyEl.value = '1';

    saveData();
}

function deleteItem(index) {
    const item = inventory[index];
    if (!item) return;
    const itemName = item.name;

    const modal = document.getElementById('confirmModal');
    const msgEl = document.getElementById('confirmMsg');
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    if (!modal || !yesBtn || !noBtn) {
        if (window.confirm('Hapus "' + itemName + '"?')) {
            inventory.splice(index, 1);
            saveData();
            showNotification('"' + itemName + '" dihapus', 'success');
        }
        return;
    }

    if (msgEl) msgEl.innerText = '"' + itemName + '" akan dihapus dari inventory.';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const newYes = yesBtn.cloneNode(true);
    const newNo = noBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYes, yesBtn);
    noBtn.parentNode.replaceChild(newNo, noBtn);

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    newYes.addEventListener('click', function() {
        closeModal();
        inventory.splice(index, 1);
        saveData();
        showNotification('"' + itemName + '" dihapus', 'success');
    });

    newNo.addEventListener('click', closeModal);
}

function exportData() {
    if (inventory.length === 0) {
        showNotification('Tidak ada data untuk di-export', 'warning');
        return;
    }
    let csv = 'No,Nama Barang,Stok Tersisa\n';
    inventory.forEach((item, index) => {
        csv += `${index + 1},"${item.name}",${item.stock}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showNotification(' Data berhasil di-export', 'success');
}

function searchTable() {
    const searchInput = document.getElementById('tableSearchInput');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const clearBtn = document.getElementById('clearSearchBtn');
    const noSearchResults = document.getElementById('noSearchResults');
    const allRows = document.querySelectorAll('.inventory-row');
    let visibleCount = 0;

    if (searchTerm === '') {
        allRows.forEach(row => { row.style.display = ''; row.classList.remove('highlight'); });
        if (noSearchResults) noSearchResults.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
    } else {
        allRows.forEach(row => {
            const name = row.getAttribute('data-item-name') || '';
            if (name.includes(searchTerm)) {
                row.style.display = '';
                row.classList.add('highlight');
                visibleCount++;
            } else {
                row.style.display = 'none';
                row.classList.remove('highlight');
            }
        });
        if (clearBtn) clearBtn.style.display = 'flex';
        if (noSearchResults) noSearchResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function clearSearch() {
    const searchInput = document.getElementById('tableSearchInput');
    if (!searchInput) return;
    searchInput.value = '';
    searchTable();
    searchInput.focus();
}

function updateNotifications() {
    const lowStockItems = inventory.filter(item => item.stock < 5);
    const badge = document.querySelector('.notification-btn .badge');
    const list = document.getElementById('lowStockList');

    if (badge) {
        badge.innerText = lowStockItems.length;
        badge.style.display = lowStockItems.length > 0 ? 'block' : 'none';
    }

    if (list) {
        if (lowStockItems.length === 0) {
            list.innerHTML = '<div class="notification-item-empty"><i class="fas fa-check-circle text-success me-2"></i>Semua stok dalam kondisi baik</div>';
        } else {
            let html = '<div class="notification-header"><i class="fas fa-triangle-exclamation text-warning me-2"></i>Stok Menipis</div>';
            lowStockItems.forEach(item => {
                html += `
                    <div class="notification-item">
                        <div class="notification-item-name">${item.name}</div>
                        <div class="notification-item-stock"><span class="badge bg-danger">${item.stock} unit</span></div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }
    }
}

function checkLowStockWarning(itemName, stock) {
    if (stock < 5 && stock >= 0) {
        showNotification(` Stok "${itemName}" tinggal ${stock} unit`, 'low');
    }
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
    }
}

document.addEventListener('click', function(event) {
    const container = document.querySelector('.notification-container');
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown && container && !container.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

function saveData() {
    localStorage.setItem('modernInventory', JSON.stringify(inventory));
    renderAll();
}

document.addEventListener('DOMContentLoaded', function() {
    renderAll();
});

function printStock() {
    if (inventory.length === 0) {
        showNotification('Tidak ada data untuk di-print', 'warning');
        return;
    }

    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const totalItems = inventory.length;
    const totalStock = inventory.reduce((sum, i) => sum + i.stock, 0);
    const lowStock = inventory.filter(i => i.stock < 5);

    let rows = inventory.map((item, index) => {
        const isLow = item.stock < 5;
        return `
            <tr class="${isLow ? 'low-row' : ''}">
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td class="${isLow ? 'low-stock' : 'ok-stock'}">${item.stock} unit</td>
                <td class="status-cell">${isLow ? ' Menipis' : ' Aman'}</td>
            </tr>
        `;
    }).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Stok - Alin's Shop</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: white; padding: 32px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 3px solid #ec4899; }
        .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .brand-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #ec4899, #be123c); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.4rem; }
        .brand-name { font-size: 1.6rem; font-weight: 800; color: #9d174d; }
        .brand-sub { font-size: 0.78rem; color: #ec4899; font-weight: 600; margin-top: 2px; }
        .doc-title { font-size: 0.85rem; color: #64748b; margin-top: 8px; }
        .header-right { text-align: right; font-size: 0.82rem; color: #64748b; line-height: 2; }
        .header-right strong { color: #9d174d; }
        .summary { display: flex; gap: 14px; margin-bottom: 24px; }
        .summary-card { flex: 1; padding: 16px 18px; border-radius: 14px; border: 1px solid #fce7f3; }
        .summary-card.pink1 { background: linear-gradient(135deg, #fff0f7, #fce7f3); }
        .summary-card.pink2 { background: linear-gradient(135deg, #fdf2f8, #fce7f3); }
        .summary-card.red { background: #fef2f2; border-color: #fecaca; }
        .summary-num { font-size: 2rem; font-weight: 800; }
        .summary-card.pink1 .summary-num { color: #ec4899; }
        .summary-card.pink2 .summary-num { color: #db2777; }
        .summary-card.red .summary-num { color: #ef4444; }
        .summary-label { font-size: 0.78rem; color: #9d174d; font-weight: 600; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: linear-gradient(135deg, #ec4899, #be123c); color: white; }
        thead th { padding: 13px 16px; text-align: left; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
        tbody tr { border-bottom: 1px solid #fce7f3; }
        tbody tr:nth-child(even) { background: #fff8fc; }
        tbody tr.low-row { background: #fffbea !important; }
        tbody td { padding: 12px 16px; font-size: 0.88rem; }
        tbody td:nth-child(3), tbody td:nth-child(4) { text-align: center; }
        .ok-stock { color: #10b981; font-weight: 700; }
        .low-stock { color: #ef4444; font-weight: 700; }
        .status-cell { font-weight: 700; font-size: 0.82rem; }
        tbody tr.low-row .status-cell { color: #d97706; }
        tbody tr:not(.low-row) .status-cell { color: #10b981; }
        .footer { border-top: 2px solid #fce7f3; padding-top: 14px; display: flex; justify-content: space-between; font-size: 0.78rem; color: #f9a8d4; }
        .footer-brand { color: #ec4899; font-weight: 700; }
        @media print { body { padding: 20px; } @page { margin: 1.5cm; size: A4; } }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">
                <div class="brand-icon"></div>
                <div><div class="brand-name">Alin's Shop</div><div class="brand-sub">Inventory Management</div></div>
            </div>
            <div class="doc-title">Laporan Data Stok Inventory</div>
        </div>
        <div class="header-right">
            <div><strong>Tanggal:</strong> ${tanggal}</div>
            <div><strong>Jam:</strong> ${jam}</div>
        </div>
    </div>
    <div class="summary">
        <div class="summary-card pink1"><div class="summary-num">${totalItems}</div><div class="summary-label">Jenis Barang</div></div>
        <div class="summary-card pink2"><div class="summary-num">${totalStock}</div><div class="summary-label">Total Unit Stok</div></div>
        <div class="summary-card red"><div class="summary-num">${lowStock.length}</div><div class="summary-label">Stok Menipis (&lt;5)</div></div>
    </div>
    <table>
        <thead><tr><th style="width:40px">No</th><th>Nama Barang</th><th style="width:120px">Stok</th><th style="width:100px">Status</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>
    <div class="footer">
        <span class="footer-brand">Alin's Shop — Inventory Management</span>
        <span>Total ${totalItems} barang · ${totalStock} unit tersimpan</span>
    </div>
    <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>
    `);
    printWindow.document.close();
}

function topbarSearchGo() {
    const val = document.getElementById('topbarSearch')?.value.trim();
    if (!val) return;
    changeView('stock');
    setTimeout(() => {
        const input = document.getElementById('tableSearchInput');
        if (input) { input.value = val; searchTable(); }
        document.getElementById('topbarSearch').value = '';
    }, 50);
}

// ==================== KASIR ====================
let cart = [];
let receiptCounter = parseInt(localStorage.getItem('receiptCounter')) || 1;

function renderKasirItems() {
    const grid = document.getElementById('kasirItemsGrid');
    if (!grid) return;

    const search = (document.getElementById('kasirSearchInput')?.value || '').toLowerCase().trim();
    const filtered = inventory.filter(item => item.name.toLowerCase().includes(search));

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="kasir-no-items"><i class="fas fa-box-open fa-2x mb-2" style="color:#f9a8d4"></i><br>Tidak ada barang</div>`;
        return;
    }

    grid.innerHTML = '';
    filtered.forEach((item) => {
        const realIndex = inventory.indexOf(item);
        const cartItem = cart.find(c => c.index === realIndex);
        const inCart = cartItem ? cartItem.qty : 0;
        const isOut = item.stock <= 0;
        const isLow = item.stock > 0 && item.stock < 5;
        const price = item.price || 0;

        grid.innerHTML += `
            <div class="kasir-item-card ${isOut ? 'out-of-stock' : ''}" onclick="${isOut ? '' : `addToCart(${realIndex})`}">
                ${inCart > 0 ? `<div class="kasir-item-badge">${inCart}</div>` : ''}
                <div class="kasir-item-icon"></div>
                <div class="kasir-item-name">${item.name}</div>
                <div class="kasir-item-price">${price > 0 ? formatRupiah(price) : '<span style="color:#f9a8d4;font-size:0.75rem">Belum ada harga</span>'}</div>
                <div class="kasir-item-stock ${isLow ? 'low' : ''}">${isOut ? ' Habis' : isLow ? ` Sisa ${item.stock}` : `Stok: ${item.stock}`}</div>
            </div>
        `;
    });
}

function addToCart(index) {
    const item = inventory[index];
    if (!item || item.stock <= 0) return;

    if (!item.price || item.price <= 0) {
        const inputPrice = prompt(`Belum ada harga untuk "${item.name}".\nMasukkan harga satuan (Rp):`);
        if (inputPrice === null) return;
        const price = parseInt(inputPrice.replace(/\D/g, ''));
        if (isNaN(price) || price <= 0) {
            showNotification('Harga tidak valid!', 'error');
            return;
        }
        item.price = price;
        saveDataSilent();
    }

    const existing = cart.find(c => c.index === index);
    if (existing) {
        if (existing.qty >= item.stock) {
            showNotification(`Stok hanya ${item.stock} unit!`, 'error');
            return;
        }
        existing.qty++;
    } else {
        cart.push({ index, name: item.name, price: item.price, qty: 1 });
    }

    renderKasirItems();
    renderCart();
    showNotification(`+1 ${item.name} ke keranjang`, 'success');
}

function renderCart() {
    const list = document.getElementById('kasirCartList');
    const emptyCart = document.getElementById('kasirEmptyCart');
    const summary = document.getElementById('kasirSummary');
    const countEl = document.getElementById('kasirCartCount');
    if (!list) return;

    const totalItems = cart.reduce((s, c) => s + c.qty, 0);
    if (countEl) countEl.innerText = `${totalItems} item`;

    if (cart.length === 0) {
        list.innerHTML = '';
        list.appendChild(document.getElementById('kasirEmptyCart') || createEmptyCartEl());
        if (emptyCart) emptyCart.style.display = 'block';
        if (summary) summary.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (summary) summary.style.display = 'block';

    list.innerHTML = '';
    cart.forEach((c, i) => {
        const subtotal = c.price * c.qty;
        const el = document.createElement('div');
        el.className = 'kasir-cart-item';
        el.innerHTML = `
            <div>
                <div class="kasir-cart-item-name">${c.name}</div>
                <div class="kasir-cart-item-price">${formatRupiah(c.price)} / item</div>
            </div>
            <div class="kasir-cart-qty-controls">
                <button class="kasir-qty-btn" onclick="changeCartQty(${i}, -1)">−</button>
                <span class="kasir-qty-num">${c.qty}</span>
                <button class="kasir-qty-btn" onclick="changeCartQty(${i}, 1)">+</button>
            </div>
            <div class="kasir-cart-subtotal">${formatRupiah(subtotal)}</div>
            <button class="kasir-cart-remove" onclick="removeFromCart(${i})"><i class="fas fa-times"></i></button>
        `;
        list.appendChild(el);
    });

    updateKasirTotal();
    hitungKembalian();
}

function createEmptyCartEl() {
    const d = document.createElement('div');
    d.id = 'kasirEmptyCart';
    d.className = 'kasir-empty-cart';
    d.innerHTML = '<i class="fas fa-shopping-basket"></i><p>Keranjang masih kosong</p>';
    return d;
}

function changeCartQty(i, delta) {
    const c = cart[i];
    if (!c) return;
    const maxStock = inventory[c.index]?.stock || 0;
    const newQty = c.qty + delta;
    if (newQty <= 0) { removeFromCart(i); return; }
    if (newQty > maxStock) { showNotification(`Stok hanya ${maxStock} unit!`, 'error'); return; }
    c.qty = newQty;
    renderKasirItems();
    renderCart();
}

function removeFromCart(i) {
    cart.splice(i, 1);
    renderKasirItems();
    renderCart();
}

function clearCart() {
    if (cart.length === 0) return;
    cart = [];
    renderKasirItems();
    renderCart();
    showNotification('Keranjang dikosongkan', 'warning');
}

function updateKasirTotal() {
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const subEl = document.getElementById('kasirSubtotal');
    const totEl = document.getElementById('kasirTotal');
    if (subEl) subEl.innerText = formatRupiah(total);
    if (totEl) totEl.innerText = formatRupiah(total);
}

function hitungKembalian() {
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const bayar = parseInt(document.getElementById('kasirBayar')?.value || '0') || 0;
    const box = document.getElementById('kasirKembalianBox');
    const el = document.getElementById('kasirKembalian');
    if (!box || !el) return;

    if (bayar <= 0) { box.style.display = 'none'; return; }

    box.style.display = 'flex';
    const kembalian = bayar - total;
    el.innerText = formatRupiah(Math.abs(kembalian));
    if (kembalian < 0) {
        box.className = 'kasir-kembalian kurang';
        box.querySelector('span:first-child').innerText = 'KURANG';
    } else {
        box.className = 'kasir-kembalian';
        box.querySelector('span:first-child').innerText = 'Kembalian';
    }
}

function prosesCheckout() {
    if (cart.length === 0) { showNotification('Keranjang masih kosong!', 'error'); return; }

    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const bayar = parseInt(document.getElementById('kasirBayar')?.value || '0') || 0;

    if (bayar < total) { showNotification('Uang bayar kurang!', 'error'); return; }

    const kembalian = bayar - total;
    const noStruk = `STR-${String(receiptCounter).padStart(4, '0')}`;
    receiptCounter++;
    localStorage.setItem('receiptCounter', receiptCounter);

    cart.forEach(c => { inventory[c.index].stock -= c.qty; });
    saveDataSilent();

    // Simpan ke riwayat transaksi
    saveTransaction({
        noStruk,
        items: cart.map(c => ({ name: c.name, price: c.price, qty: c.qty })),
        total,
        bayar,
        kembalian,
        timestamp: new Date().toISOString()
    });

    cetakStruk({ noStruk, items: [...cart], total, bayar, kembalian });

    cart = [];
    document.getElementById('kasirBayar').value = '';
    renderKasirItems();
    renderCart();
    renderAll();
    showNotification(` Transaksi ${noStruk} berhasil!`, 'success');
}

function cetakStruk({ noStruk, items, total, bayar, kembalian }) {
    const now = new Date();
    const tgl = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const totalQty = items.reduce((s, c) => s + c.qty, 0);

    const rows = items.map(c => `
        <tr>
            <td style="padding:5px 3px;border-bottom:1px dotted #fce7f3;vertical-align:top;">${c.name}</td>
            <td style="padding:5px 3px;border-bottom:1px dotted #fce7f3;text-align:right;">${c.qty}x</td>
            <td style="padding:5px 3px;border-bottom:1px dotted #fce7f3;text-align:right;">${formatRupiah(c.price)}</td>
            <td style="padding:5px 3px;border-bottom:1px dotted #fce7f3;text-align:right;font-weight:700;">${formatRupiah(c.price * c.qty)}</td>
        </tr>
    `).join('');

    const html = `
        <div style="text-align:center;margin-bottom:14px;">
            <div style="font-size:2rem;"></div>
            <div style="font-size:1.1rem;font-weight:900;color:#9d174d;letter-spacing:1px;text-transform:uppercase;">ALIN'S SHOP</div>
        </div>
        <div style="border-top:2px solid #ec4899;margin:10px 0;"></div>
        <div style="font-size:0.72rem;color:#64748b;margin-bottom:3px;">No. Struk <span style="float:right;color:#1e293b;font-weight:700;">${noStruk}</span></div>
        <div style="font-size:0.72rem;color:#64748b;margin-bottom:3px;clear:both;">Tanggal <span style="float:right;color:#1e293b;font-weight:700;">${tgl}</span></div>
        <div style="font-size:0.72rem;color:#64748b;margin-bottom:3px;clear:both;">Jam <span style="float:right;color:#1e293b;font-weight:700;">${jam}</span></div>
        <div style="clear:both;border-top:1px dashed #f9a8d4;margin:10px 0;"></div>
        <table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:0.75rem;">
            <thead>
                <tr>
                    <th style="padding:5px 3px;border-bottom:1px solid #fce7f3;color:#be185d;font-size:0.65rem;text-transform:uppercase;text-align:left;">Barang</th>
                    <th style="padding:5px 3px;border-bottom:1px solid #fce7f3;color:#be185d;font-size:0.65rem;text-transform:uppercase;text-align:right;">Qty</th>
                    <th style="padding:5px 3px;border-bottom:1px solid #fce7f3;color:#be185d;font-size:0.65rem;text-transform:uppercase;text-align:right;">Harga</th>
                    <th style="padding:5px 3px;border-bottom:1px solid #fce7f3;color:#be185d;font-size:0.65rem;text-transform:uppercase;text-align:right;">Total</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <div style="border-top:1px dashed #f9a8d4;margin:10px 0;"></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.8rem;color:#64748b;"><span>Total Item</span><span>${totalQty} pcs</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:1rem;font-weight:900;color:#9d174d;border-top:2px solid #ec4899;margin-top:6px;"><span>TOTAL</span><span>${formatRupiah(total)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.82rem;color:#1e293b;font-weight:700;"><span>Tunai</span><span>${formatRupiah(bayar)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.88rem;color:#10b981;font-weight:800;"><span>Kembalian</span><span>${formatRupiah(kembalian)}</span></div>
        <div style="text-align:center;margin:12px 0;letter-spacing:4px;font-size:0.6rem;color:#f9a8d4;">||||| |||| ||||| |||| |||||</div>
        <div style="border-top:1px dashed #f9a8d4;margin:10px 0;"></div>
        <div style="text-align:center;font-size:0.7rem;color:#94a3b8;line-height:1.9;">
            <div style="color:#ec4899;font-weight:800;font-size:0.85rem;margin-bottom:4px;">Terima Kasih!</div>
            <div>Barang yang sudah dibeli</div>
            <div>tidak dapat dikembalikan</div>
            <div style="margin-top:6px;color:#ec4899;font-weight:600;">— Alin's Shop —</div>
        </div>
    `;

    const modal = document.getElementById('strukModal');
    const modalContent = document.getElementById('strukContent');
    if (modal && modalContent) {
        modalContent.innerHTML = html;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function tutupStruk() {
    const modal = document.getElementById('strukModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

function printStrukModal() {
    const content = document.getElementById('strukContent');
    if (!content) return;
    const printArea = document.getElementById('strukPrintArea');
    if (printArea) {
        printArea.innerHTML = content.innerHTML;
        printArea.style.display = 'block';
    }
    window.print();
    if (printArea) {
        setTimeout(() => { printArea.style.display = 'none'; }, 1000);
    }
}

function downloadStruk() {
    const content = document.getElementById('strukContent');
    const btn = document.getElementById('btnDownloadStruk');
    if (!content) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyiapkan...';
    btn.disabled = true;

    // Buat elemen render sementara
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 320px;
        background: white;
        padding: 0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #1e293b;
        box-shadow: none;
        border-radius: 0;
    `;

    // Header struk
    const header = document.createElement('div');
    header.style.cssText = 'background: linear-gradient(135deg,#ec4899,#be123c); color:white; padding:14px 20px; display:flex; align-items:center; gap:10px;';
    header.innerHTML = '<i style="font-size:1.1rem;" class="fas fa-receipt"></i><span style="font-weight:800;font-size:0.95rem;">Struk Pembelian</span>';

    // Konten
    const body = document.createElement('div');
    body.style.cssText = 'padding: 20px 18px; font-family: "Courier New", monospace; font-size: 12px; color: #1e293b;';
    body.innerHTML = content.innerHTML;

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    document.body.appendChild(wrapper);

    // Ambil noStruk dari konten untuk nama file
    const noStrukEl = wrapper.querySelector('span[style*="float:right"]');
    const noStruk = noStrukEl ? noStrukEl.innerText.trim() : 'struk';

    setTimeout(() => {
        html2canvas(wrapper, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        }).then(canvas => {
            document.body.removeChild(wrapper);
            const link = document.createElement('a');
            link.download = `${noStruk}_Alins-Shop.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            btn.innerHTML = '<i class="fas fa-check"></i> Tersimpan!';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
            showNotification('Struk berhasil didownload!', 'success');
        }).catch(() => {
            document.body.removeChild(wrapper);
            btn.innerHTML = originalText;
            btn.disabled = false;
            showNotification('Gagal download struk', 'error');
        });
    }, 100);
}

function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

function saveDataSilent() {
    localStorage.setItem('modernInventory', JSON.stringify(inventory));
}

// ==================== REKAP PENJUALAN ====================

let rekapMode = 'harian';
let rekapBarChartInstance = null;

function getTransactions() {
    return JSON.parse(localStorage.getItem('transactionHistory')) || [];
}

function saveTransaction(trx) {
    const all = getTransactions();
    all.push(trx);
    localStorage.setItem('transactionHistory', JSON.stringify(all));
}

function initRekap() {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const monthStr = now.toISOString().slice(0, 7);

    const ftgl = document.getElementById('filterTanggal');
    const fbulan = document.getElementById('filterBulan');
    if (ftgl && !ftgl.value) ftgl.value = todayStr;
    if (fbulan && !fbulan.value) fbulan.value = monthStr;

    // Isi pilihan tahun dari data transaksi
    const all = getTransactions();
    const years = [...new Set(all.map(t => new Date(t.timestamp).getFullYear()))].sort((a, b) => b - a);
    if (years.length === 0) years.push(now.getFullYear());
    const select = document.getElementById('filterTahun');
    if (select) {
        select.innerHTML = years.map(y => `<option value="${y}" ${y === now.getFullYear() ? 'selected' : ''}>${y}</option>`).join('');
    }

    rekapMode = 'harian';
    setRekapMode('harian');
}

function setRekapMode(mode) {
    rekapMode = mode;
    ['harian','bulanan','tahunan'].forEach(m => {
        const tab = document.getElementById(`tab-${m}`);
        const filter = document.getElementById(`filter-${m}`);
        if (tab) tab.classList.toggle('active', m === mode);
        if (filter) filter.style.display = m === mode ? 'flex' : 'none';
    });
    renderRekap();
}

function getFilteredTransactions() {
    const all = getTransactions();
    if (rekapMode === 'harian') {
        const tgl = document.getElementById('filterTanggal')?.value;
        if (!tgl) return [];
        return all.filter(t => t.timestamp.slice(0, 10) === tgl);
    } else if (rekapMode === 'bulanan') {
        const bulan = document.getElementById('filterBulan')?.value;
        if (!bulan) return [];
        return all.filter(t => t.timestamp.slice(0, 7) === bulan);
    } else {
        const tahun = document.getElementById('filterTahun')?.value;
        if (!tahun) return [];
        return all.filter(t => new Date(t.timestamp).getFullYear() == tahun);
    }
}

function renderRekap() {
    const transactions = getFilteredTransactions();

    const totalIncome = transactions.reduce((s, t) => s + t.total, 0);
    const trxCount = transactions.length;
    const itemsSold = transactions.reduce((s, t) => s + t.items.reduce((si, i) => si + i.qty, 0), 0);
    const avgTrx = trxCount > 0 ? Math.round(totalIncome / trxCount) : 0;

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.innerText = val; };
    el('rekapIncome', formatRupiah(totalIncome));
    el('rekapTrxCount', trxCount);
    el('rekapItemsSold', itemsSold + ' pcs');
    el('rekapAvgTrx', formatRupiah(avgTrx));

    renderRekapChart(transactions);
    renderRekapTopItems(transactions);
    renderRekapTrxTable(transactions);
    renderRekapItemTable(transactions);
}

function renderRekapChart(transactions) {
    const canvas = document.getElementById('rekapBarChart');
    const emptyEl = document.getElementById('rekapEmptyChart');
    if (!canvas) return;

    if (rekapBarChartInstance) {
        rekapBarChartInstance.destroy();
        rekapBarChartInstance = null;
    }

    if (transactions.length === 0) {
        canvas.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    canvas.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';

    let labels = [], data = [];

    if (rekapMode === 'harian') {
        const hours = {};
        for (let h = 0; h < 24; h++) hours[String(h).padStart(2,'0')] = 0;
        transactions.forEach(t => {
            const h = new Date(t.timestamp).getHours();
            hours[String(h).padStart(2,'0')] += t.total;
        });
        labels = Object.keys(hours).map(h => `${h}:00`);
        data = Object.values(hours);
        document.getElementById('rekapChartTitle').innerText = 'Grafik Harian';
        document.getElementById('rekapChartSub').innerText = 'Pendapatan per jam';
    } else if (rekapMode === 'bulanan') {
        const bulan = document.getElementById('filterBulan')?.value;
        const [year, month] = bulan.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const days = {};
        for (let d = 1; d <= daysInMonth; d++) days[String(d).padStart(2,'0')] = 0;
        transactions.forEach(t => {
            const d = String(new Date(t.timestamp).getDate()).padStart(2,'0');
            days[d] += t.total;
        });
        labels = Object.keys(days).map(d => `${parseInt(d)}`);
        data = Object.values(days);
        document.getElementById('rekapChartTitle').innerText = 'Grafik Bulanan';
        document.getElementById('rekapChartSub').innerText = `Pendapatan per tanggal — ${formatBulan(bulan)}`;
    } else {
        const tahun = document.getElementById('filterTahun')?.value;
        const months = {};
        for (let m = 1; m <= 12; m++) months[String(m).padStart(2,'0')] = 0;
        transactions.forEach(t => {
            const m = String(new Date(t.timestamp).getMonth() + 1).padStart(2,'0');
            months[m] += t.total;
        });
        const namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        labels = namaBulan;
        data = Object.values(months);
        document.getElementById('rekapChartTitle').innerText = 'Grafik Tahunan';
        document.getElementById('rekapChartSub').innerText = `Pendapatan per bulan — ${tahun}`;
    }

    rekapBarChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Pendapatan',
                data,
                backgroundColor: 'rgba(236,72,153,0.7)',
                borderColor: '#ec4899',
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => formatRupiah(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => {
                            if (val >= 1000000) return 'Rp ' + (val/1000000).toFixed(1) + 'jt';
                            if (val >= 1000) return 'Rp ' + (val/1000).toFixed(0) + 'rb';
                            return 'Rp ' + val;
                        },
                        font: { size: 11 }
                    },
                    grid: { color: '#fce7f3' }
                },
                x: {
                    ticks: { font: { size: 10 } },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderRekapTopItems(transactions) {
    const container = document.getElementById('rekapTopItems');
    if (!container) return;

    const itemMap = {};
    transactions.forEach(t => {
        t.items.forEach(i => {
            if (!itemMap[i.name]) itemMap[i.name] = 0;
            itemMap[i.name] += i.qty;
        });
    });

    const sorted = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 7);

    if (sorted.length === 0) {
        container.innerHTML = '<div class="rekap-no-data"><i class="fas fa-box-open fa-2x mb-2"></i><p>Belum ada data</p></div>';
        return;
    }

    container.innerHTML = sorted.map(([name, qty], idx) => {
        const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
        return `
            <div class="rekap-top-item">
                <div class="rekap-top-rank ${rankClass}">${idx + 1}</div>
                <div class="rekap-top-name">${name}</div>
                <div class="rekap-top-qty">${qty} pcs</div>
            </div>
        `;
    }).join('');
}

function renderRekapTrxTable(transactions) {
    const tbody = document.getElementById('rekapTrxBody');
    const noData = document.getElementById('rekapNoTrx');
    const subtitle = document.getElementById('rekapTrxSubtitle');
    if (!tbody) return;

    if (subtitle) subtitle.innerText = `${transactions.length} transaksi ditemukan`;

    if (transactions.length === 0) {
        tbody.innerHTML = '';
        if (noData) noData.style.display = 'flex';
        return;
    }
    if (noData) noData.style.display = 'none';

    const sorted = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    tbody.innerHTML = sorted.map(t => {
        const d = new Date(t.timestamp);
        const tgl = formatTanggal(t.timestamp);
        const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const itemsStr = t.items.map(i => `${i.name} (${i.qty})`).join(', ');
        return `
            <tr>
                <td><span class="rekap-trx-struk">${t.noStruk}</span></td>
                <td><div class="rekap-trx-date">${tgl}</div><div style="font-size:0.72rem;color:#f9a8d4;">${jam}</div></td>
                <td><div class="rekap-trx-items">${itemsStr}</div></td>
                <td class="rekap-trx-total">${formatRupiah(t.total)}</td>
            </tr>
        `;
    }).join('');
}

function renderRekapItemTable(transactions) {
    const tbody = document.getElementById('rekapItemBody');
    const noData = document.getElementById('rekapNoItem');
    if (!tbody) return;

    const itemMap = {};
    transactions.forEach(t => {
        t.items.forEach(i => {
            if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, income: 0, price: i.price };
            itemMap[i.name].qty += i.qty;
            itemMap[i.name].income += i.price * i.qty;
        });
    });

    const sorted = Object.entries(itemMap).sort((a, b) => b[1].income - a[1].income);

    if (sorted.length === 0) {
        tbody.innerHTML = '';
        if (noData) noData.style.display = 'flex';
        return;
    }
    if (noData) noData.style.display = 'none';

    tbody.innerHTML = sorted.map(([name, data]) => `
        <tr>
            <td style="font-weight:600;">${name}</td>
            <td class="text-center" style="font-weight:700;color:#ec4899;">${data.qty} pcs</td>
            <td class="text-end" style="color:#64748b;">${formatRupiah(data.price)}</td>
            <td class="text-end" style="font-weight:700;color:#be123c;">${formatRupiah(data.income)}</td>
        </tr>
    `).join('');
}

function exportRekap() {
    const transactions = getFilteredTransactions();
    if (transactions.length === 0) {
        showNotification('Tidak ada data untuk di-export', 'warning');
        return;
    }

    let label = '';
    if (rekapMode === 'harian') label = document.getElementById('filterTanggal')?.value || 'harian';
    else if (rekapMode === 'bulanan') label = document.getElementById('filterBulan')?.value || 'bulanan';
    else label = document.getElementById('filterTahun')?.value || 'tahunan';

    const totalIncome = transactions.reduce((s, t) => s + t.total, 0);
    const trxCount = transactions.length;
    const itemsSold = transactions.reduce((s, t) => s + t.items.reduce((si, i) => si + i.qty, 0), 0);

    let csv = `Rekap Penjualan - ${label}\n`;
    csv += `Total Pendapatan,${totalIncome}\n`;
    csv += `Jumlah Transaksi,${trxCount}\n`;
    csv += `Total Item Terjual,${itemsSold}\n\n`;

    csv += `Per Barang\nNama,Qty,Harga Satuan,Total Income\n`;
    const itemMap = {};
    transactions.forEach(t => {
        t.items.forEach(i => {
            if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, income: 0, price: i.price };
            itemMap[i.name].qty += i.qty;
            itemMap[i.name].income += i.price * i.qty;
        });
    });
    Object.entries(itemMap).forEach(([name, d]) => {
        csv += `"${name}",${d.qty},${d.price},${d.income}\n`;
    });

    csv += `\nDetail Transaksi\nNo. Struk,Tanggal,Waktu,Item,Total,Bayar,Kembalian\n`;
    [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(t => {
        const d = new Date(t.timestamp);
        const tgl = d.toLocaleDateString('id-ID');
        const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const items = t.items.map(i => `${i.name}(${i.qty})`).join('; ');
        csv += `${t.noStruk},${tgl},${jam},"${items}",${t.total},${t.bayar},${t.kembalian}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_${label}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Rekap berhasil di-export!', 'success');
}

function formatTanggal(str) {
    const d = new Date(str);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatBulan(str) {
    const [y, m] = str.split('-');
    const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${namaBulan[parseInt(m) - 1]} ${y}`;
}