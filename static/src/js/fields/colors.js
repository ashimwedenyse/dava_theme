/** @odoo-module **/
import { getColor } from "@web/core/colors/colors";

// Primary, Accent, Success, Warning, Danger, Info
var backend_color = [
    "#2C3E50", // Primary
    "#F39C12", // Accent
    "#2ECC71", // Success
    "#F1C40F", // Warning
    "#E74C3C", // Danger
    "#3498DB", // Info

    // Complementary colors for charts
    "#9B59B6", "#1ABC9C", "#2C3E50", "#16A085",
    "#27AE60", "#2980B9", "#8E44AD", "#D35400"
];

for (let i=0; i<backend_color.length; i++){
    getColor[i] = backend_color[i]
}