import Appointment from '../models/Appointment.js';

export const getRevenue = async (req, res) => {
  try {
    const { period } = req.query;

    let groupBy = '$week';
    let dateFormat = '%Y-W%V';

    if (period === 'month') {
      groupBy = '$month';
      dateFormat = '%Y-%m';
    } else if (period === 'year') {
      groupBy = '$year';
      dateFormat = '%Y';
    }

    const revenueData = await Appointment.aggregate([
      {
        $match: { status: 'accepted' },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$desiredDate' } },
          total: { $sum: '$revenue' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const categoryData = await Appointment.aggregate([
      {
        $match: { status: 'accepted' },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $unwind: '$service',
      },
      {
        $group: {
          _id: '$service.category',
          total: { $sum: '$revenue' },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    const stats = await Appointment.aggregate([
      {
        $match: { status: 'accepted' },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalAppointments: { $sum: 1 },
          averageRevenue: { $avg: '$revenue' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      revenueData,
      categoryData,
      stats: stats[0] || { totalRevenue: 0, totalAppointments: 0, averageRevenue: 0 },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
