export const ConstantDate = {
  getRssFeedsURLs: () => {
    const getMonths = (startDate, endDate) => {
      const start = startDate.split("-");
      const end = endDate.split("-");
      const startYear = parseInt(start[0]);
      const endYear = parseInt(end[0]);
      const dates = [];
      for (let i = startYear; i <= endYear; i++) {
        const endMonth = i !== endYear ? 11 : parseInt(end[1]) - 1;
        const startMonth = i === startYear ? parseInt(start[1]) - 1 : 0;
        for (
          let k = startMonth;
          k <= endMonth;
          k = k > 12 ? k % 12 || 11 : k + 1
        ) {
          const month = k + 1;
          const displayMonth = month < 10 ? `0${month}` : month;
          dates.push(`${i}-${displayMonth}`);
        }
      }
      return dates;
    };
    const start = new Date("2007-02");
    const startDate = `${start.getFullYear()}-${start.getMonth() + 2}`;

    const end = new Date();
    const endDate = `${end.getFullYear()}-${end.getMonth() + 1}`;

    return getMonths(startDate, endDate)
      .reverse()
      .map((current) => {
        return `https://www.sec.gov/Archives/edgar/monthly/xbrlrss-${current}.xml`;
      });
  },
};
