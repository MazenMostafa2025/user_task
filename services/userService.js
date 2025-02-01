const prisma = require('../prisma/prisma');
const buildFilters = require('../utils/buildFilters');
exports.getPaginatedUsers = (skip, take) => {
    return prisma.user.findMany({skip, take})
}

exports.getUserById = (id) => {
    return prisma.user.findUnique({where: {id}});
}

exports.getUserDetails = (id) => {
    return prisma.user.findUnique({where: {id}, select: {name: true, email: true}});
}

exports.updateUser = (id, body) => {
    return prisma.user.update({where: {id}, data: body,  select: {
        name: true,
        email: true,
      }});
}

exports.softDeleteUser = async (id) => {
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      select: {name: true},
    });
  };
  


exports.getFilteredUsers = async ({ name, email, isVerified, startDate, endDate, page, limit }) => {
  const filters = buildFilters({ name, email, isVerified, startDate, endDate});
  
  const skip = (page - 1) * limit;
  const take = limit * 1;
  
  // get users based on filters
  const users = await prisma.user.findMany({
    where: filters,
    skip,
    take,
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      createdAt: true,
      },
    });
  
  // Get total user count and total verified users 
  const userCounts = await prisma.user.aggregate({
    _count: {
      _all: true,
      isVerified: true,
    },
  });
  
  return {
    users,
    totalUsersInQuery: users.length,
    totalUsers: userCounts._count._all,
    totalVerifiedUsers: userCounts._count.isVerified,
  };
  };

  exports.getTopLoginFrequency = () => {
    return prisma.user.findMany({
      orderBy: {
        loginFrequency: 'desc',
      },
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        loginFrequency: true,
        lastLogin: true,
      },
    });
  };


  exports.getInactiveUsers = async ({ period }) => {
    const filters = {};
    const now = new Date();
  
    if (period === 'hour') {
      filters.lastLogin = { lte: new Date(now.getTime() - 60 * 60 * 1000) }; 
    } else if (period === 'month') {
      filters.lastLogin = { lte: new Date(now.setMonth(now.getMonth() - 1)) }; 
    }
  
    const inactiveUsers = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        email: true,
        lastLogin: true,
      },
    });
  
    return { inactiveUsers };
  };
  