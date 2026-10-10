function getTaxYearDateRange(taxYear) {
    if (!/^\d{4}-\d{2}$/.test(taxYear)) {
        throw new Error("Invalid tax year format");
    }

    const startYear = Number(taxYear.substring(0, 4));

    const startDate = `${startYear}-07-01`;
    const endDate = `${startYear + 1}-06-30`;

    return {
        startDate,
        endDate,
    };
}

module.exports = {
    getTaxYearDateRange,
};