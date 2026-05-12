// ============================================================
// DEMO DATA — Pre-loaded expenses, budgets, recurring in ₹
// ============================================================

import { generateId, toDateString } from './utils.js?v=family-auth-5';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateString(d);
}

function monthsAgo(n, day = 15) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return toDateString(d);
}

export function getDemoExpenses() {
  return [
    // This month (last 30 days)
    { id: generateId(), date: daysAgo(0), amount: 450,  category: 'Food',          description: 'Lunch at office canteen' },
    { id: generateId(), date: daysAgo(0), amount: 120,  category: 'Transport',      description: 'Uber ride to market' },
    { id: generateId(), date: daysAgo(1), amount: 2500, category: 'Shopping',       description: 'New headphones from Amazon' },
    { id: generateId(), date: daysAgo(1), amount: 350,  category: 'Food',           description: 'Dinner at Barbeque Nation' },
    { id: generateId(), date: daysAgo(2), amount: 800,  category: 'Groceries',      description: 'Weekly grocery run at DMart' },
    { id: generateId(), date: daysAgo(2), amount: 150,  category: 'Transport',      description: 'Auto rickshaw' },
    { id: generateId(), date: daysAgo(3), amount: 1200, category: 'Entertainment',  description: 'Movie tickets + popcorn' },
    { id: generateId(), date: daysAgo(3), amount: 500,  category: 'Food',           description: 'Pizza Hut delivery' },
    { id: generateId(), date: daysAgo(4), amount: 3500, category: 'Health',         description: 'Doctor consultation' },
    { id: generateId(), date: daysAgo(5), amount: 250,  category: 'Food',           description: 'Chai + snacks at Tapri' },
    { id: generateId(), date: daysAgo(5), amount: 1800, category: 'Bills',          description: 'Electricity bill' },
    { id: generateId(), date: daysAgo(6), amount: 650,  category: 'Groceries',      description: 'Fruits and vegetables' },
    { id: generateId(), date: daysAgo(7), amount: 400,  category: 'Transport',      description: 'Petrol refill' },
    { id: generateId(), date: daysAgo(7), amount: 1500, category: 'Education',      description: 'Udemy course purchase' },
    { id: generateId(), date: daysAgo(8), amount: 300,  category: 'Food',           description: 'Swiggy order - biryani' },
    { id: generateId(), date: daysAgo(9), amount: 4500, category: 'Shopping',       description: 'Shoes from Myntra' },
    { id: generateId(), date: daysAgo(10), amount: 200, category: 'Food',           description: 'Coffee at Third Wave' },
    { id: generateId(), date: daysAgo(10), amount: 750, category: 'Entertainment',  description: 'Netflix subscription' },
    { id: generateId(), date: daysAgo(11), amount: 950, category: 'Groceries',      description: 'BigBasket monthly order' },
    { id: generateId(), date: daysAgo(12), amount: 180, category: 'Transport',      description: 'Metro card recharge' },
    { id: generateId(), date: daysAgo(14), amount: 2200,category: 'Health',         description: 'Pharmacy - medicines' },
    { id: generateId(), date: daysAgo(15), amount: 350, category: 'Food',           description: 'Dominos with friends' },
    { id: generateId(), date: daysAgo(16), amount: 1100,category: 'Bills',          description: 'Mobile recharge - Jio' },
    { id: generateId(), date: daysAgo(18), amount: 600, category: 'Entertainment',  description: 'Spotify annual plan' },
    { id: generateId(), date: daysAgo(20), amount: 15000, category: 'Rent',         description: 'Monthly room rent' },
    { id: generateId(), date: daysAgo(22), amount: 420, category: 'Food',           description: 'South Indian thali' },
    { id: generateId(), date: daysAgo(25), amount: 1400,category: 'Shopping',       description: 'Books from Flipkart' },
    { id: generateId(), date: daysAgo(27), amount: 280, category: 'Transport',      description: 'Ola cab airport' },

    // 1 month ago
    { id: generateId(), date: monthsAgo(1, 3),  amount: 550,  category: 'Food',          description: 'Zomato lunch order' },
    { id: generateId(), date: monthsAgo(1, 5),  amount: 3200, category: 'Shopping',      description: 'Jacket from H&M' },
    { id: generateId(), date: monthsAgo(1, 7),  amount: 1200, category: 'Bills',         description: 'Internet bill - Airtel' },
    { id: generateId(), date: monthsAgo(1, 9),  amount: 450,  category: 'Transport',     description: 'Rapido bike taxi' },
    { id: generateId(), date: monthsAgo(1, 11), amount: 15000,category: 'Rent',          description: 'Monthly room rent' },
    { id: generateId(), date: monthsAgo(1, 13), amount: 900,  category: 'Groceries',     description: 'Zepto groceries' },
    { id: generateId(), date: monthsAgo(1, 15), amount: 1800, category: 'Health',        description: 'Gym membership' },
    { id: generateId(), date: monthsAgo(1, 18), amount: 2500, category: 'Entertainment', description: 'Concert tickets' },
    { id: generateId(), date: monthsAgo(1, 20), amount: 350,  category: 'Food',          description: 'McDonalds drive-thru' },
    { id: generateId(), date: monthsAgo(1, 23), amount: 4200, category: 'Education',     description: 'Coursera subscription' },
    { id: generateId(), date: monthsAgo(1, 25), amount: 680,  category: 'Transport',     description: 'Train tickets' },
    { id: generateId(), date: monthsAgo(1, 28), amount: 1650, category: 'Bills',         description: 'Gas cylinder booking' },

    // 2 months ago
    { id: generateId(), date: monthsAgo(2, 2),  amount: 800,  category: 'Food',          description: 'Family dinner out' },
    { id: generateId(), date: monthsAgo(2, 5),  amount: 5500, category: 'Shopping',      description: 'Watch from Titan' },
    { id: generateId(), date: monthsAgo(2, 8),  amount: 15000,category: 'Rent',          description: 'Monthly room rent' },
    { id: generateId(), date: monthsAgo(2, 11), amount: 1400, category: 'Bills',         description: 'Water + maintenance' },
    { id: generateId(), date: monthsAgo(2, 14), amount: 300,  category: 'Entertainment', description: 'Disney+ Hotstar' },
    { id: generateId(), date: monthsAgo(2, 17), amount: 2100, category: 'Health',        description: 'Blood tests & checkup' },
    { id: generateId(), date: monthsAgo(2, 20), amount: 750,  category: 'Groceries',     description: 'Monthly essentials' },
    { id: generateId(), date: monthsAgo(2, 24), amount: 420,  category: 'Food',          description: 'Café visit with friends' },
    { id: generateId(), date: monthsAgo(2, 27), amount: 350,  category: 'Transport',     description: 'Bus pass renewal' },

    // 3 months ago
    { id: generateId(), date: monthsAgo(3, 1),  amount: 15000,category: 'Rent',          description: 'Monthly room rent' },
    { id: generateId(), date: monthsAgo(3, 4),  amount: 2800, category: 'Shopping',      description: 'Kurta set from Ajio' },
    { id: generateId(), date: monthsAgo(3, 8),  amount: 1800, category: 'Bills',         description: 'Electricity bill' },
    { id: generateId(), date: monthsAgo(3, 12), amount: 600,  category: 'Food',          description: 'Birthday treat' },
    { id: generateId(), date: monthsAgo(3, 16), amount: 950,  category: 'Groceries',     description: 'Big Bazaar shopping' },
    { id: generateId(), date: monthsAgo(3, 20), amount: 1500, category: 'Entertainment', description: 'IPL match tickets' },
    { id: generateId(), date: monthsAgo(3, 25), amount: 3500, category: 'Health',        description: 'Dental work' },
    { id: generateId(), date: monthsAgo(3, 28), amount: 250,  category: 'Transport',     description: 'Parking charges' },

    // 4 months ago
    { id: generateId(), date: monthsAgo(4, 1),  amount: 15000,category: 'Rent',          description: 'Monthly room rent' },
    { id: generateId(), date: monthsAgo(4, 6),  amount: 4200, category: 'Education',     description: 'Textbooks' },
    { id: generateId(), date: monthsAgo(4, 10), amount: 1600, category: 'Bills',         description: 'Phone + internet' },
    { id: generateId(), date: monthsAgo(4, 14), amount: 2800, category: 'Shopping',      description: 'Backpack from Wildcraft' },
    { id: generateId(), date: monthsAgo(4, 18), amount: 550,  category: 'Food',          description: 'Street food festival' },
    { id: generateId(), date: monthsAgo(4, 22), amount: 700,  category: 'Groceries',     description: 'Organic veggies' },
    { id: generateId(), date: monthsAgo(4, 26), amount: 1200, category: 'Entertainment', description: 'Comedy show' },

    // 5 months ago
    { id: generateId(), date: monthsAgo(5, 1),  amount: 15000,category: 'Rent',          description: 'Monthly room rent' },
    { id: generateId(), date: monthsAgo(5, 5),  amount: 6500, category: 'Shopping',      description: 'Diwali shopping' },
    { id: generateId(), date: monthsAgo(5, 10), amount: 2200, category: 'Bills',         description: 'Annual insurance premium' },
    { id: generateId(), date: monthsAgo(5, 15), amount: 1800, category: 'Food',          description: 'Diwali party dinner' },
    { id: generateId(), date: monthsAgo(5, 20), amount: 500,  category: 'Transport',     description: 'Holiday travel' },
    { id: generateId(), date: monthsAgo(5, 25), amount: 850,  category: 'Groceries',     description: 'Festival groceries' },
  ];
}

export function getDemoBudgets() {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return [
    { id: generateId(), category: 'Food',          monthlyLimit: 8000,  month: monthKey },
    { id: generateId(), category: 'Transport',      monthlyLimit: 3000,  month: monthKey },
    { id: generateId(), category: 'Shopping',       monthlyLimit: 5000,  month: monthKey },
    { id: generateId(), category: 'Entertainment',  monthlyLimit: 3000,  month: monthKey },
    { id: generateId(), category: 'Bills',          monthlyLimit: 5000,  month: monthKey },
    { id: generateId(), category: 'Health',         monthlyLimit: 4000,  month: monthKey },
    { id: generateId(), category: 'Groceries',      monthlyLimit: 4000,  month: monthKey },
    { id: generateId(), category: 'Rent',           monthlyLimit: 16000, month: monthKey },
  ];
}

export function getDemoRecurring() {
  return [
    {
      id: generateId(),
      description: 'Room Rent',
      amount: 15000,
      category: 'Rent',
      frequency: 'monthly',
      nextDueDate: getNextDue(1),
      isPaid: false
    },
    {
      id: generateId(),
      description: 'Netflix Subscription',
      amount: 649,
      category: 'Entertainment',
      frequency: 'monthly',
      nextDueDate: getNextDue(10),
      isPaid: false
    },
    {
      id: generateId(),
      description: 'Gym Membership',
      amount: 1800,
      category: 'Health',
      frequency: 'monthly',
      nextDueDate: getNextDue(15),
      isPaid: false
    },
    {
      id: generateId(),
      description: 'Spotify Annual',
      amount: 1189,
      category: 'Entertainment',
      frequency: 'yearly',
      nextDueDate: monthsAgo(-3, 18),
      isPaid: false
    },
    {
      id: generateId(),
      description: 'Newspaper Weekly',
      amount: 120,
      category: 'Other',
      frequency: 'weekly',
      nextDueDate: daysAgo(-2),
      isPaid: false
    }
  ];
}

export function getDemoSettings() {
  return {
    overallBudget: 50000
  };
}

function getNextDue(dayOfMonth) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (d < now) {
    d.setMonth(d.getMonth() + 1);
  }
  return toDateString(d);
}
