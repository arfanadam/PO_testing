/**
 * Purchase Order Form Application v2.0
 * A modern, modular PO management system with PDF generation
 */

const app = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        MAX_ITEMS: 11,
        STORAGE_KEY: 'po_draft_data',
        DATE_FORMAT: /^(\d{2})\/(\d{2})\/(\d{4})$/,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    // PDF Coordinates (must remain unchanged for custom pre-printed forms)
    const PDF_COORDS = {
        // Form fields positions
        vendorName: { x: 85.04, y: 609.45 },
        address1: { x: 85.04, y: 594.45 },
        address2: { x: 85.04, y: 579.45 },
        address3: { x: 85.04, y: 564.45 },
        vendorPhone: { x: 85.04, y: 549.45 },
        vendorEmail: { x: 85.04, y: 534.45 },
        serialNum: { x: 433.70, y: 609.45 },
        datePO: { x: 411.02, y: 530.08 },
        poTitle: { x: 377.01, y: 36.85 },
        grandTotal: { x: 453.54, y: 79.37 },
        requestedBy: { x: 124.73, y: 73.70 },
        
        // Item table positions
        itemNum: 51.42,
        itemName: 85.04,
        quantity: 311.81,
        cost: 382.68,
        total: 453.54,
        itemStartY: 464.88,
        itemRowHeight: 20,
        detailRowHeight: 10
    };

    // State
    let state = {
        itemCount: 1,
        items: []
    };

    /**
     * Initialize the application
     */
    function init() {
        // Set today's date as default
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        document.getElementById('datePO').value = formattedDate;
        
        // Add first item
        addItem();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('PO Form v2.0 initialized');
    }

    /**
     * Setup global event listeners
     */
    function setupEventListeners() {
        // Email validation on blur
        document.getElementById('VendorEmail').addEventListener('blur', function() {
            validateEmail(this);
        });

        // Date validation on blur
        document.getElementById('datePO').addEventListener('blur', function() {
            validateDate(this);
        });

        // Close modal on overlay click
        document.getElementById('previewModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closePreview();
            }
        });

        // Keyboard support for modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closePreview();
            }
        });
    }

    /**
     * Add a new item to the form
     */
    function addItem() {
        if (state.itemCount >= CONFIG.MAX_ITEMS) {
            showMaxItemsError();
            return false;
        }

        const container = document.getElementById('itemsContainer');
        const itemNum = state.itemCount;

        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.id = `item-${itemNum}`;
        itemCard.innerHTML = `
            <div class="item-header">
                <span class="item-title">Item ${itemNum}</span>
                <button type="button" onclick="app.addDetail(${itemNum})" class="btn-primary btn-sm" aria-label="Add detail for item ${itemNum}">
                    + Detail
                </button>
            </div>
            <div class="item-fields">
                <div class="form-group">
                    <input type="text" id="item${itemNum}" name="item[]" placeholder="Item name (max 26 chars)" maxlength="26" required aria-label="Item ${itemNum} name">
                </div>
                <div class="form-group">
                    <input type="number" id="quantity${itemNum}" name="quantity[]" placeholder="Qty" min="1" value="1" oninput="calculateTotal(${itemNum})" aria-label="Quantity for item ${itemNum}">
                </div>
                <div class="form-group">
                    <input type="number" id="cost${itemNum}" name="cost[]" placeholder="Price" min="0.01" step="0.01" oninput="calculateTotal(${itemNum})" aria-label="Price per unit for item ${itemNum}">
                </div>
            </div>
            <div class="details-container" id="details-container${itemNum}"></div>
            <div class="item-total">Total: <span id="total${itemNum}">0.00</span></div>
        `;

        container.appendChild(itemCard);
        updateItemCounter();
        
        // Focus on the new item name field
        document.getElementById(`item${itemNum}`).focus();
        
        return true;
    }

    /**
     * Remove the last item from the form
     */
    function removeItem() {
        if (state.itemCount <= 1) {
            showToast('At least one item is required', 'error');
            return;
        }

        const itemCard = document.getElementById(`item-${state.itemCount}`);
        if (itemCard) {
            itemCard.remove();
            state.itemCount--;
            updateItemLabels();
            updateItemCounter();
            calculateGrandTotal();
        }
    }

    /**
     * Add a detail/sub-item to an item
     */
    function addDetail(itemNum) {
        const detailsContainer = document.getElementById(`details-container${itemNum}`);
        
        const detailDiv = document.createElement('div');
        detailDiv.className = 'detail-item';
        detailDiv.innerHTML = `
            <input type="text" placeholder="Detail description (max 26 chars)" maxlength="26" aria-label="Detail for item ${itemNum}">
            <button type="button" onclick="app.removeDetail(this)" class="btn-danger btn-sm" aria-label="Remove this detail">
                ×
            </button>
        `;
        
        detailsContainer.appendChild(detailDiv);
    }

    /**
     * Remove a detail/sub-item
     */
    function removeDetail(button) {
        const detailItem = button.parentElement;
        detailItem.parentElement.removeChild(detailItem);
    }

    /**
     * Calculate total for a specific item
     */
    function calculateTotal(itemNum) {
        const quantity = parseFloat(document.getElementById(`quantity${itemNum}`).value) || 0;
        const cost = parseFloat(document.getElementById(`cost${itemNum}`).value) || 0;
        const total = (quantity * cost).toFixed(2);
        
        document.getElementById(`total${itemNum}`).textContent = total;
        calculateGrandTotal();
    }

    /**
     * Calculate and display grand total
     */
    function calculateGrandTotal() {
        let grandTotal = 0;
        
        for (let i = 1; i <= state.itemCount; i++) {
            const quantity = parseFloat(document.getElementById(`quantity${i}`)?.value) || 0;
            const cost = parseFloat(document.getElementById(`cost${i}`)?.value) || 0;
            grandTotal += quantity * cost;
        }
        
        document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
    }

    /**
     * Update item labels after removal
     */
    function updateItemLabels() {
        for (let i = 1; i <= state.itemCount; i++) {
            const itemCard = document.getElementById(`item-${i}`);
            if (itemCard) {
                const title = itemCard.querySelector('.item-title');
                if (title) {
                    title.textContent = `Item ${i}`;
                }
            }
        }
    }

    /**
     * Update the item counter badge
     */
    function updateItemCounter() {
        document.getElementById('itemCounter').textContent = `${state.itemCount}/${CONFIG.MAX_ITEMS} items`;
    }

    /**
     * Show max items error
     */
    function showMaxItemsError() {
        const errorEl = document.getElementById('maxItemsError');
        errorEl.classList.add('visible');
        setTimeout(() => {
            errorEl.classList.remove('visible');
        }, 3000);
    }

    /**
     * Validate email format
     */
    function validateEmail(input) {
        const errorEl = document.getElementById('emailError');
        const isValid = CONFIG.EMAIL_REGEX.test(input.value);
        
        if (input.value && !isValid) {
            errorEl.classList.add('visible');
            showToast('Invalid email format', 'error');
        } else {
            errorEl.classList.remove('visible');
        }
        
        return isValid;
    }

    /**
     * Validate date format (DD/MM/YYYY)
     */
    function validateDate(input) {
        const errorEl = document.getElementById('dateError');
        const value = input.value;
        
        if (!value) {
            errorEl.classList.remove('visible');
            return true;
        }
        
        const match = value.match(CONFIG.DATE_FORMAT);
        
        if (!match) {
            errorEl.classList.add('visible');
            showToast('Invalid date format. Use DD/MM/YYYY', 'error');
            return false;
        }
        
        const [, day, month, year] = match;
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        const isValid = dateObj.getFullYear() === parseInt(year) && 
                       dateObj.getMonth() === parseInt(month) - 1 && 
                       dateObj.getDate() === parseInt(day);
        
        if (!isValid) {
            errorEl.classList.add('visible');
            showToast('Invalid date', 'error');
        } else {
            errorEl.classList.remove('visible');
        }
        
        return isValid;
    }

    /**
     * Preview the Purchase Order
     */
    function previewPO() {
        const previewContent = document.getElementById('previewContent');
        
        // Gather all data
        const poData = getFormData();
        
        // Build preview HTML
        let html = `
            <div class="preview-section">
                <h3>PO Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>PO Title:</label>
                        <p>${escapeHtml(poData.POName) || '—'}</p>
                    </div>
                    <div class="form-group">
                        <label>Serial Number:</label>
                        <p>${escapeHtml(poData.serialnum) || '—'}</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Date:</label>
                        <p>${escapeHtml(poData.datePO) || '—'}</p>
                    </div>
                </div>
            </div>
            
            <div class="preview-section">
                <h3>Vendor Information</h3>
                <p><strong>Name:</strong> ${escapeHtml(poData.VendorName) || '—'}</p>
                <p><strong>Phone:</strong> ${escapeHtml(poData.VendorPhone) || '—'}</p>
                <p><strong>Fax:</strong> ${escapeHtml(poData.VendorFax) || '—'}</p>
                <p><strong>Email:</strong> ${escapeHtml(poData.VendorEmail) || '—'}</p>
                <p><strong>Address:</strong> ${escapeHtml(poData.address1) || '—'}${poData.address2 ? ', ' + escapeHtml(poData.address2) : ''}${poData.address3 ? ', ' + escapeHtml(poData.address3) : ''}</p>
            </div>
            
            <div class="preview-section">
                <h3>Order Items</h3>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (let i = 1; i <= state.itemCount; i++) {
            const itemEl = document.getElementById(`item${i}`);
            const qtyEl = document.getElementById(`quantity${i}`);
            const costEl = document.getElementById(`cost${i}`);
            const totalEl = document.getElementById(`total${i}`);
            
            if (itemEl) {
                const details = getItemDetails(i);
                
                html += `
                        <tr>
                            <td>${i}</td>
                            <td>
                                ${escapeHtml(itemEl.value) || '—'}
                                ${details.length > 0 ? '<br><small class="text-muted">Details:<br>• ' + details.join('<br>• ') + '</small>' : ''}
                            </td>
                            <td>${qtyEl?.value || '0'}</td>
                            <td>${costEl?.value ? parseFloat(costEl.value).toFixed(2) : '0.00'}</td>
                            <td><strong>${totalEl?.textContent || '0.00'}</strong></td>
                        </tr>
                `;
            }
        }
        
        html += `
                    </tbody>
                </table>
                <div class="grand-total">
                    <h3>Grand Total: ${document.getElementById('grandTotal').textContent}</h3>
                </div>
            </div>
        `;
        
        previewContent.innerHTML = html;
        
        // Show modal
        document.getElementById('previewModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the preview modal
     */
    function closePreview() {
        document.getElementById('previewModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Get item details for a specific item
     */
    function getItemDetails(itemNum) {
        const container = document.getElementById(`details-container${itemNum}`);
        if (!container) return [];
        
        const inputs = container.querySelectorAll('input');
        const details = [];
        inputs.forEach(input => {
            if (input.value.trim()) {
                details.push(input.value.trim());
            }
        });
        
        return details;
    }

    /**
     * Gather all form data
     */
    function getFormData() {
        return {
            POName: document.getElementById('POName').value,
            VendorName: document.getElementById('VendorName').value,
            VendorPhone: document.getElementById('VendorPhone').value,
            VendorFax: document.getElementById('VendorFax').value,
            VendorEmail: document.getElementById('VendorEmail').value,
            address1: document.getElementById('address1').value,
            address2: document.getElementById('address2').value,
            address3: document.getElementById('address3').value,
            serialnum: document.getElementById('serialnum').value,
            datePO: document.getElementById('datePO').value
        };
    }

    /**
     * Generate PDF with exact coordinates for pre-printed forms
     */
    async function generatePDF() {
        try {
            const { PDFDocument, rgb, StandardFonts } = PDFLib;
            
            // Create PDF document
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([612, 792]); // Letter size
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            // Get form data
            const poData = getFormData();
            const grandTotal = document.getElementById('grandTotal').textContent;
            
            // Define fields with their positions (EXACT COORDINATES - DO NOT MODIFY)
            const fields = [
                { label: 'Vendor Name:', value: poData.VendorName, x: PDF_COORDS.vendorName.x, y: PDF_COORDS.vendorName.y },
                { label: 'Vendor Address 1:', value: poData.address1, x: PDF_COORDS.address1.x, y: PDF_COORDS.address1.y },
                { label: 'Vendor Address 2:', value: poData.address2, x: PDF_COORDS.address2.x, y: PDF_COORDS.address2.y },
                { label: 'Vendor Address 3:', value: poData.address3, x: PDF_COORDS.address3.x, y: PDF_COORDS.address3.y },
                { label: 'Vendor Phone:', value: poData.VendorPhone, x: PDF_COORDS.vendorPhone.x, y: PDF_COORDS.vendorPhone.y },
                { label: 'Vendor Email:', value: poData.VendorEmail, x: PDF_COORDS.vendorEmail.x, y: PDF_COORDS.vendorEmail.y },
                { label: 'Serial No:', value: poData.serialnum, x: PDF_COORDS.serialNum.x, y: PDF_COORDS.serialNum.y },
                { label: 'Date:', value: poData.datePO, x: PDF_COORDS.datePO.x, y: PDF_COORDS.datePO.y },
                { label: 'PO Title:', value: poData.POName, x: PDF_COORDS.poTitle.x, y: PDF_COORDS.poTitle.y },
                { label: 'Grand Total:', value: grandTotal, x: PDF_COORDS.grandTotal.x, y: PDF_COORDS.grandTotal.y },
                { label: 'Requested By', value: 'RASODIN', x: PDF_COORDS.requestedBy.x, y: PDF_COORDS.requestedBy.y },
            ];
            
            // Draw items
            let yPosition = PDF_COORDS.itemStartY;
            
            for (let i = 1; i <= state.itemCount; i++) {
                const itemEl = document.getElementById(`item${i}`);
                const qtyEl = document.getElementById(`quantity${i}`);
                const costEl = document.getElementById(`cost${i}`);
                
                if (!itemEl) continue;
                
                const itemName = itemEl.value || '';
                const quantity = parseFloat(qtyEl?.value) || 0;
                const cost = parseFloat(costEl?.value) || 0;
                const formattedCost = cost.toFixed(2);
                const total = (quantity * cost).toFixed(2);
                
                // Draw item number and name
                page.drawText(i.toString(), { x: PDF_COORDS.itemNum, y: yPosition, size: 11, font, color: rgb(0, 0, 0) });
                page.drawText(itemName, { x: PDF_COORDS.itemName, y: yPosition, size: 11, font, color: rgb(0, 0, 0) });
                
                // Draw quantity, cost, and total
                page.drawText(quantity.toString(), { x: PDF_COORDS.quantity, y: yPosition, size: 11, font, color: rgb(0, 0, 0) });
                page.drawText(formattedCost, { x: PDF_COORDS.cost, y: yPosition, size: 11, font, color: rgb(0, 0, 0) });
                page.drawText(total, { x: PDF_COORDS.total, y: yPosition, size: 11, font, color: rgb(0, 0, 0) });
                
                // Add item details
                const details = getItemDetails(i);
                let detailYPosition = yPosition - PDF_COORDS.detailRowHeight;
                let detailHeight = details.length * PDF_COORDS.detailRowHeight;
                
                details.forEach(detail => {
                    if (detail) {
                        page.drawText(detail, { x: PDF_COORDS.itemName, y: detailYPosition, size: 10, font, color: rgb(0, 0, 0) });
                        detailYPosition -= PDF_COORDS.detailRowHeight;
                    }
                });
                
                // Adjust y position for next item
                yPosition -= (PDF_COORDS.itemRowHeight + detailHeight);
            }
            
            // Draw form fields
            fields.forEach(field => {
                if (field.value) {
                    page.drawText(field.value, {
                        x: field.x,
                        y: field.y,
                        size: 12,
                        font,
                        color: rgb(0, 0, 0)
                    });
                }
            });
            
            // Save and open PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            showToast('PDF generated successfully!', 'success');
            
        } catch (error) {
            console.error('PDF Generation Error:', error);
            showToast('Error generating PDF. Please try again.', 'error');
        }
    }

    /**
     * Save form data as draft to localStorage
     */
    function saveDraft() {
        try {
            const formData = getFormData();
            const items = [];
            
            for (let i = 1; i <= state.itemCount; i++) {
                const itemEl = document.getElementById(`item${i}`);
                const qtyEl = document.getElementById(`quantity${i}`);
                const costEl = document.getElementById(`cost${i}`);
                
                if (itemEl) {
                    items.push({
                        name: itemEl.value,
                        quantity: qtyEl?.value || '',
                        cost: costEl?.value || '',
                        details: getItemDetails(i)
                    });
                }
            }
            
            const draftData = {
                form: formData,
                items: items,
                itemCount: state.itemCount,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(draftData));
            showToast('Draft saved successfully!', 'success');
            
        } catch (error) {
            console.error('Save Error:', error);
            showToast('Error saving draft. Please try again.', 'error');
        }
    }

    /**
     * Load saved draft from localStorage
     */
    function loadDraft() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
            
            if (!savedData) {
                showToast('No saved draft found', 'info');
                return;
            }
            
            const draftData = JSON.parse(savedData);
            
            // Clear current form
            clearForm(false);
            
            // Restore form data
            const form = draftData.form;
            if (form) {
                Object.keys(form).forEach(key => {
                    const el = document.getElementById(key);
                    if (el) {
                        el.value = form[key] || '';
                    }
                });
            }
            
            // Restore items
            state.itemCount = 0;
            document.getElementById('itemsContainer').innerHTML = '';
            
            if (draftData.items && draftData.items.length > 0) {
                draftData.items.forEach((itemData, index) => {
                    state.itemCount++;
                    addItem();
                    
                    // Fill item data
                    const itemNum = state.itemCount;
                    const itemEl = document.getElementById(`item${itemNum}`);
                    const qtyEl = document.getElementById(`quantity${itemNum}`);
                    const costEl = document.getElementById(`cost${itemNum}`);
                    
                    if (itemEl) itemEl.value = itemData.name || '';
                    if (qtyEl) qtyEl.value = itemData.quantity || '';
                    if (costEl) costEl.value = itemData.cost || '';
                    
                    // Add details
                    if (itemData.details && itemData.details.length > 0) {
                        itemData.details.forEach(() => {
                            addDetail(itemNum);
                        });
                        
                        // Fill detail values
                        const detailInputs = document.getElementById(`details-container${itemNum}`).querySelectorAll('input');
                        detailInputs.forEach((input, idx) => {
                            if (itemData.details[idx]) {
                                input.value = itemData.details[idx];
                            }
                        });
                    }
                    
                    calculateTotal(itemNum);
                });
            }
            
            updateItemCounter();
            calculateGrandTotal();
            
            showToast('Draft loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Load Error:', error);
            showToast('Error loading draft. Please try again.', 'error');
        }
    }

    /**
     * Clear the entire form
     */
    function clearForm(confirmClear = true) {
        if (confirmClear && !confirm('Are you sure you want to clear all form data?')) {
            return;
        }
        
        // Clear all text inputs
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
            input.value = '';
        });
        
        // Reset number inputs to default
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.value = input.id.startsWith('quantity') ? '1' : '';
        });
        
        // Clear items container
        document.getElementById('itemsContainer').innerHTML = '';
        
        // Reset state
        state.itemCount = 0;
        
        // Add first item
        addItem();
        
        // Reset totals
        calculateGrandTotal();
        
        // Set today's date
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        document.getElementById('datePO').value = formattedDate;
        
        showToast('Form cleared', 'info');
    }

    /**
     * Export form data to Excel
     */
    async function exportExcel() {
        try {
            const poData = getFormData();
            
            // Create new workbook
            const workbook = XLSX.utils.book_new();
            
            // Prepare data arrays
            const data = [
                ['Purchase Order'],
                [''],
                ['PO Title:', poData.POName],
                ['Serial Number:', poData.serialnum],
                ['Date:', poData.datePO],
                [''],
                ['Vendor Information'],
                ['Vendor Name:', poData.VendorName],
                ['Address Line 1:', poData.address1],
                ['Address Line 2:', poData.address2],
                ['Address Line 3:', poData.address3],
                ['Phone:', poData.VendorPhone],
                ['Fax:', poData.VendorFax],
                ['Email:', poData.VendorEmail],
                [''],
                ['Order Items'],
                ['#', 'Item Name', 'Quantity', 'Unit Price', 'Total', 'Details']
            ];
            
            // Add items
            for (let i = 1; i <= state.itemCount; i++) {
                const itemEl = document.getElementById(`item${i}`);
                const qtyEl = document.getElementById(`quantity${i}`);
                const costEl = document.getElementById(`cost${i}`);
                
                if (itemEl) {
                    const details = getItemDetails(i).join('; ');
                    data.push([
                        i,
                        itemEl.value || '',
                        qtyEl?.value || '',
                        costEl?.value || '',
                        document.getElementById(`total${i}`)?.textContent || '',
                        details
                    ]);
                }
            }
            
            // Add grand total
            data.push([]);
            data.push(['', '', '', 'Grand Total:', document.getElementById('grandTotal').textContent]);
            
            // Create worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            
            // Set column widths
            worksheet['!cols'] = [
                { wch: 5 },  // #
                { wch: 30 }, // Item Name
                { wch: 10 }, // Quantity
                { wch: 12 }, // Unit Price
                { wch: 12 }, // Total
                { wch: 30 }  // Details
            ];
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Order');
            
            // Generate filename with date
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `PO_${poData.POName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.xlsx`;
            
            // Download file
            XLSX.writeFile(workbook, filename);
            
            showToast('Excel exported successfully!', 'success');
            
        } catch (error) {
            console.error('Excel Export Error:', error);
            showToast('Error exporting to Excel. Please try again.', 'error');
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API
    return {
        init,
        addItem,
        removeItem,
        addDetail,
        removeDetail,
        calculateTotal,
        calculateGrandTotal,
        previewPO,
        closePreview,
        generatePDF,
        saveDraft,
        loadDraft,
        clearForm,
        exportExcel,
        validateEmail,
        validateDate
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', app.init);