export default function calculateDatesDifference(date1: string, date2: string) {
    const diffInMilliseconds = Math.abs(new Date(date2).getTime() - new Date(date1).getTime());

    if (diffInMilliseconds < 60000) {
        const seconds = Math.ceil(diffInMilliseconds / 1000);
        if (seconds === 1) {
            return "1 second";
        } else {
            return seconds + " seconds";
        }
    } else if (diffInMilliseconds < 3600000) {
        const minutes = Math.floor(diffInMilliseconds / (1000 * 60));
        if (minutes === 1) {
            return "1 minute";
        } else {
            return minutes + " minutes";
        }
    } else if (diffInMilliseconds < 86400000) {
        const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
        if (hours === 1) {
            return "1 hour";
        } else {
            return hours + " hours";
        }
    } else if (diffInMilliseconds < 2592000000) {
        const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
        if (days === 1) {
            return "1 day";
        } else {
            return days + " days";
        }
    } else if (diffInMilliseconds < 31536000000) {
        const months = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 30));
        if (months === 1) {
            return "1 month";
        } else {
            return months + " months";
        }
    } else {
        const years = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 365));
        if (years === 1) {
            return "1 year";
        } else {
            return years + " years";
        }
    }
}