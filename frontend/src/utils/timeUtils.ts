export const formatDateTime = (dateTimeString: string | undefined | null): string => {
    if (!dateTimeString) return 'N/A';
    
    try {
        const date = new Date(dateTimeString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        return new Intl.DateTimeFormat('en-IN', options).format(date);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

// Optional: Add specific formatters for different use cases
export const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

export const formatTime = (timeString: string | undefined | null): string => {
    if (!timeString) return 'N/A';
    
    try {
        const date = new Date(timeString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Time';
        }

        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid Time';
    }
};

interface Duration {
    days: number | string;
    hours: number | string;
    minutes: number | string;
    seconds: number | string;
}

export const calculateDuration = (startTime: string, endTime: string): Duration => {
    try {
        // Handle empty or invalid inputs
        if (!startTime || !endTime) {
            return { days: 'NaN', hours: 'NaN', minutes: 'NaN', seconds: 'NaN' };
        }

        // For time-only strings (outings)
        if (!startTime.includes('/') && !endTime.includes('/')) {
            const parseTime = (timeStr: string) => {
                const lowerStr = timeStr.toLowerCase().trim();
                let hours = 0, minutes = 0, seconds = 0;

                if (lowerStr.includes('am') || lowerStr.includes('pm')) {
                    const [time, meridiem] = lowerStr.split(' ');
                    const [h, m, s = 0] = time.split(':').map(Number);
                    hours = h; minutes = m; seconds = s;
                    if (meridiem === 'pm' && hours !== 12) hours += 12;
                    else if (meridiem === 'am' && hours === 12) hours = 0;
                } else {
                    const [h, m, s = 0] = lowerStr.split(':').map(Number);
                    hours = h; minutes = m; seconds = s;
                }
                return (hours * 3600) + (minutes * 60) + seconds;
            };

            const startSeconds = parseTime(startTime);
            const endSeconds = parseTime(endTime);
            const diffInSeconds = Math.abs(endSeconds - startSeconds);

            return {
                days: 0,
                hours: Math.floor(diffInSeconds / 3600),
                minutes: Math.floor((diffInSeconds % 3600) / 60),
                seconds: diffInSeconds % 60
            };
        }

        // For full dates (outpasses)
        // Parse DD/MM/YYYY format
        const [startDay, startMonth, startYear] = startTime.split('/').map(Number);
        const [endDay, endMonth, endYear] = endTime.split('/').map(Number);
        
        const start = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { days: 'NaN', hours: 'NaN', minutes: 'NaN', seconds: 'NaN' };
        }

        const diffInMilliseconds = end.getTime() - start.getTime();
        const diffInSeconds = diffInMilliseconds / 1000;

        return {
            days: Math.floor(diffInSeconds / (24 * 3600)),
            hours: Math.floor((diffInSeconds % (24 * 3600)) / 3600),
            minutes: Math.floor((diffInSeconds % 3600) / 60),
            seconds: Math.floor(diffInSeconds % 60)
        };
    } catch (error) {
        console.error('Error calculating duration:', error);
        return { days: 'NaN', hours: 'NaN', minutes: 'NaN', seconds: 'NaN' };
    }
};

export const convertToIST = (dateTimeString: string) => {
    if (!dateTimeString) return 'N/A';
    
    try {
        // If it's already in the correct format, return as is
        if (dateTimeString.match(/^\d{1,2}:\d{2}:\d{2}\s*(am|pm)$/i)) {
            return dateTimeString.trim();
        }

        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            return dateTimeString; // Return original if parsing fails
        }

        return date.toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error converting date:', error);
        return dateTimeString;
    }
};

export const formatDuration = (duration: Duration): string => {
    if (duration.days === 'NaN' || duration.hours === 'NaN' || 
        duration.minutes === 'NaN' || duration.seconds === 'NaN') {
        return 'Invalid Duration';
    }

    const parts: string[] = [];

    if (typeof duration.days === 'number' && duration.days > 0) {
        parts.push(`${duration.days} day${duration.days > 1 ? 's' : ''}`);
    }
    if (typeof duration.hours === 'number' && duration.hours > 0) {
        parts.push(`${duration.hours} hour${duration.hours > 1 ? 's' : ''}`);
    }
    if (typeof duration.minutes === 'number' && duration.minutes > 0) {
        parts.push(`${duration.minutes} minute${duration.minutes > 1 ? 's' : ''}`);
    }
    if (typeof duration.seconds === 'number' && duration.seconds > 0) {
        parts.push(`${duration.seconds} second${duration.seconds > 1 ? 's' : ''}`);
    }

    if (parts.length === 0) return '0 seconds';
    return parts.join(', ');
};


{/* dateTimeString in :  In the format             "requested_time": "18/2/2025, 3:41:23 am", */}
export const formatRequestTime = (dateTimeString: string) => {
    try {
        // Manually parse DD/MM/YYYY format
        const [datePart, timePart] = dateTimeString.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);

        // Create Date object (JS months are 0-based)
        const date = new Date(year, month - 1, day, ...parseTime(timePart));

        // Add 5 hours 30 minutes for IST
        date.setMinutes(date.getMinutes() + 330);

        return date.toLocaleString('en-IN', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return dateTimeString; // Return original string if parsing fails
    }
};

// Function to convert "h:mm:ss am/pm" to [hour, minute, second]
const parseTime = (timeString: string): number[] => {
    const [time, modifier] = timeString.split(' ');
    let [hour, minute, second] = time.split(':').map(Number);
    
    if (modifier.toLowerCase() === 'pm' && hour !== 12) hour += 12;
    if (modifier.toLowerCase() === 'am' && hour === 12) hour = 0;
    
    return [hour, minute, second];
};
