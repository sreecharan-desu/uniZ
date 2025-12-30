"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimeOnly = exports.formatDateTime = exports.formatDate = exports.formatTime = void 0;
exports.parseExcelSerialDate = parseExcelSerialDate;
const formatTime = (date) => new Date(date).toLocaleString("en-IN").split(",")[1];
exports.formatTime = formatTime;
const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");
exports.formatDate = formatDate;
const formatDateTime = (date) => new Date(date).toLocaleString("en-IN");
exports.formatDateTime = formatDateTime;
const formatTimeOnly = (date) => new Date(date).toLocaleTimeString("en-IN");
exports.formatTimeOnly = formatTimeOnly;
function parseExcelSerialDate(serial) {
    if (typeof serial === "string") {
        const d = new Date(serial);
        if (!isNaN(d.getTime()))
            return d;
        console.warn(`Invalid DOB string: ${serial}, defaulting to now`);
        return new Date();
    }
    const excelEpoch = new Date(1899, 11, 30);
    const days = Math.floor(serial);
    const ms = (serial - days) * 86400000;
    const date = new Date(excelEpoch.getTime() + days * 86400000 + ms);
    if (isNaN(date.getTime())) {
        console.warn(`Invalid DOB serial: ${serial}, defaulting to now`);
        return new Date();
    }
    return date;
}
