const buildFilters = ({ name, email, isVerified, startDate, endDate}) => {
  const filters = {};
  if (name) filters.name = { contains: name, mode: 'insensitive' };
  if (email) filters.email = { contains: email, mode: 'insensitive' };
  if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
  if (startDate || endDate) {
    filters.createdAt = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }
  return filters;
}
module.exports = buildFilters;
