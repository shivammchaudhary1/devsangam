import { DigitalProductModel, OrderModel } from '../models/commerce.model.ts';
import { ContactMessageModel } from '../models/contact-message.model.ts';
import { MantraModel } from '../models/mantra.model.ts';
import { PracticeSessionModel } from '../models/practice-session.model.ts';
import { UserModel } from '../models/user.model.ts';

export async function getAdminMetrics() {
  const since = new Date(Date.now() - 30 * 86400000);
  const [
    users,
    newUsers,
    practice,
    freeMantras,
    paidMantras,
    products,
    publishedProducts,
    orders,
    revenue,
    contacts,
    recentUsers,
    recentOrders,
    recentContacts,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ createdAt: { $gte: since } }),
    PracticeSessionModel.aggregate([
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          chants: { $sum: '$completedCount' },
          durationSeconds: { $sum: '$activeDurationSeconds' },
        },
      },
    ]),
    MantraModel.countDocuments({ accessType: { $ne: 'paid' } }),
    MantraModel.countDocuments({ accessType: 'paid' }),
    DigitalProductModel.countDocuments(),
    DigitalProductModel.countDocuments({ published: true }),
    OrderModel.countDocuments(),
    OrderModel.aggregate([
      { $match: { status: { $in: ['paid', 'refunded'] } } },
      {
        $group: {
          _id: null,
          capturedPayments: { $sum: 1 },
          capturedRevenuePaise: { $sum: '$amountPaise' },
          refundedPaise: { $sum: '$refundedPaise' },
        },
      },
    ]),
    ContactMessageModel.countDocuments({ status: 'new' }),
    UserModel.find()
      .select('name createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    OrderModel.find()
      .select('title amountPaise currency status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    ContactMessageModel.find()
      .select('name category status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);
  return {
    users,
    newUsers,
    practice: practice[0] ?? {
      sessions: 0,
      completed: 0,
      chants: 0,
      durationSeconds: 0,
    },
    freeMantras,
    paidMantras,
    products,
    publishedProducts,
    orders,
    revenue: revenue[0] ?? {
      capturedPayments: 0,
      capturedRevenuePaise: 0,
      refundedPaise: 0,
    },
    contacts,
    recentUsers,
    recentOrders,
    recentContacts,
  };
}
