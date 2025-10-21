export const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
};

export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

export const truncateString = (str, num) => {
    if (str.length > num) {
        return str.slice(0, num) + '...';
    }
    return str;
};