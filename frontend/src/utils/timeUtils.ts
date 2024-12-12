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
        if (startTime.includes('pm') || startTime.includes('am')) {
            // Convert 12-hour format to 24-hour for calculation
            const parseTime = (timeStr: string) => {
                const [time, meridiem] = timeStr.trim().split(' ');
                const [hours, minutes, seconds = 0] = time.split(':').map(Number);
                let hour = hours;
                
                if (meridiem.toLowerCase() === 'pm' && hours !== 12) {
                    hour = hours + 12;
                } else if (meridiem.toLowerCase() === 'am' && hours === 12) {
                    hour = 0;
                }
                
                return (hour * 60 * 60) + (minutes * 60) + seconds;
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

export const formatRequestTime = (dateTimeString: string) => {
    try {
        const date = new Date(dateTimeString);
        
        // Add 5 hours and 30 minutes for IST
        date.setHours(date.getHours() + 5);
        date.setMinutes(date.getMinutes() + 30);
        
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
        console.error('Error formatting time:', error);
        return dateTimeString; // Return original string if parsing fails
    }
};