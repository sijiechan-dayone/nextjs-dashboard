import bcrypt from 'bcrypt';
import sql from '../lib/db';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { TransactionSql } from 'postgres';

async function seedUsers(transaction: TransactionSql) {
  await transaction`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await transaction`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
            otpSecret TEXT
    );
  `;

    await sql `ALTER TABLE users ADD COLUMN otpSecret TEXT`;

  return Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return transaction`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );
}

async function seedInvoices(transaction: TransactionSql) {
  await transaction`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await transaction`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  return Promise.all(
    invoices.map(
      (invoice) => transaction`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );
}

async function seedCustomers(transaction: TransactionSql) {
  await transaction`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await transaction`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  return Promise.all(
    customers.map(
      (customer) => transaction`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );
}

async function seedRevenue(transaction: TransactionSql) {
  await transaction`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  return Promise.all(
    revenue.map(
      (rev) => transaction`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );
}

export async function GET() {
  try {
    await sql.begin(async (transaction) => {
      await seedUsers(transaction);
      await seedCustomers(transaction);
      await seedInvoices(transaction);
      await seedRevenue(transaction);
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Database seeding failed:', error);
    return Response.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}