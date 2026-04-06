# Purchase Order Form v2.0

A modern, responsive web application for generating professional Purchase Order (PO) documents as PDF. This tool is designed to work with pre-printed custom paper forms with specific border alignments.

## 🌟 Features

### Core Features
- **Dynamic Item Management**: Add up to 11 items with automatic calculations
- **Sub-items/Details**: Add detailed descriptions under each item
- **Real-time Calculations**: Automatic total and grand total calculations
- **PDF Generation**: Generate PDFs with exact coordinates for pre-printed forms
- **Preview Mode**: Review your PO before generating the PDF
- **Save/Load Drafts**: Save your work locally and resume later
- **Excel Export**: Export PO data to Excel format

### User Experience
- **Modern UI**: Clean, professional design with responsive layout
- **Form Validation**: Email and date format validation
- **Toast Notifications**: User-friendly feedback for all actions
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Mobile Responsive**: Works on all device sizes

## 🚀 Quick Start

1. **Open the application**: Simply open `index.html` in your web browser
2. **Fill in vendor information**: Complete the required fields
3. **Add items**: Click "Add Item" to add products/services
4. **Add details**: Use the "+ Detail" button to add sub-items
5. **Preview**: Click "Preview" to review before generating
6. **Generate PDF**: Click "Generate PDF" to create your document

## 📁 Project Structure

```
PO_testing/
├── index.html      # Main HTML file
├── styles.css      # All styling (CSS variables, responsive design)
├── app.js          # Application logic (modular architecture)
└── README.md       # This file
```

## 🎯 Key Components

### HTML (`index.html`)
- Semantic HTML5 structure
- Accessible form elements with ARIA attributes
- Modal for preview functionality
- Toast notification system

### CSS (`styles.css`)
- CSS Variables for consistent theming
- Mobile-first responsive design
- Modern card-based layout
- Print-friendly styles

### JavaScript (`app.js`)
- Module pattern for encapsulation
- State management
- PDF coordinate system (unchanged from original)
- LocalStorage for draft saving

## ⚙️ Configuration

### PDF Coordinates
The PDF generation uses exact coordinates to align with pre-printed forms. These coordinates are defined in `PDF_COORDS` object in `app.js` and **must not be modified** unless you have new pre-printed forms.

```javascript
const PDF_COORDS = {
    vendorName: { x: 85.04, y: 609.45 },
    address1: { x: 85.04, y: 594.45 },
    // ... more coordinates
};
```

### Application Settings
```javascript
const CONFIG = {
    MAX_ITEMS: 11,              // Maximum items allowed
    STORAGE_KEY: 'po_draft_data', // LocalStorage key
    DATE_FORMAT: /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};
```

## 📝 Usage Guide

### Creating a Purchase Order

1. **PO Information**
   - Enter PO Title (required)
   - Add Serial Number (optional)
   - Set Date in DD/MM/YYYY format

2. **Vendor Information**
   - Vendor Name (required)
   - Phone Number (required)
   - Email (optional, validated)
   - Address lines (Line 1 required)
   - Fax (optional)

3. **Order Items**
   - Click "+ Add Item" to add items
   - Enter item name (max 26 characters)
   - Set quantity and price per unit
   - Click "+ Detail" to add sub-items
   - Automatic total calculation

4. **Actions**
   - **Preview**: Review before generating
   - **Generate PDF**: Create PDF document
   - **Save Draft**: Save to browser storage
   - **Load Draft**: Restore saved draft
   - **Export Excel**: Download as .xlsx file
   - **Clear Form**: Reset all fields

### Validation Rules

- **Email**: Must match standard email format
- **Date**: Must be DD/MM/YYYY format with valid date
- **Items**: Maximum 11 items allowed
- **Required Fields**: Marked with red asterisk (*)

## 🔧 Customization

### Changing Colors
Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #3498db;
    --danger-color: #e74c3c;
    --success-color: #2ec736;
    /* ... more variables */
}
```

### Adding New Fields
1. Add HTML input in `index.html`
2. Add corresponding CSS if needed
3. Update `getFormData()` in `app.js`
4. Add to PDF generation if needed

### Modifying PDF Layout
⚠️ **Warning**: Only modify if you have new pre-printed forms!

Update the `PDF_COORDS` object in `app.js` with new coordinates.

## 🌐 Browser Compatibility

- Chrome (Recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 💾 Data Storage

- **Drafts**: Saved to browser's localStorage
- **No server required**: All data stays on your device
- **Privacy**: No data is transmitted externally

## 📊 Excel Export Format

The exported Excel file includes:
- PO header information
- Vendor details
- Itemized list with quantities and prices
- Sub-item details
- Grand total

## 🐛 Troubleshooting

### PDF Not Generating
- Check browser console for errors
- Ensure all required fields are filled
- Verify PDF library loaded correctly

### Draft Not Saving
- Check browser localStorage is enabled
- Ensure sufficient storage space
- Try a different browser

### Calculations Incorrect
- Clear browser cache
- Check for JavaScript errors
- Verify all item fields have valid numbers

## 🔄 Version History

### v2.0 (Current)
- Complete code refactor
- Modern UI/UX design
- Preview functionality
- Save/Load drafts
- Excel export
- Enhanced validation
- Mobile responsive
- Accessibility improvements

### v1.2 Beta (Original)
- Basic PDF generation
- Item management
- Sub-items support
- Excel template filling

## 📞 Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Test in different browsers
4. Verify all files are in the same directory

## 📄 License

This project is provided as-is for business use.

## 🙏 Credits

Original concept and PDF coordinate system designed for custom pre-printed forms.

---

**Last Updated**: October 2024  
**Version**: 2.0  
**Status**: Production Ready