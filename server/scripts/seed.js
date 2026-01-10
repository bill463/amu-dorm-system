const { User, Room } = require('../models');
const sequelize = require('../config/database');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync({ alter: true }); // Ensure tables exist

    // Seed Admin
    const adminExists = await User.findByPk('admin');
    if (!adminExists) {
      await User.create({
        id: 'admin',
        name: 'System Admin',
        password: 'admin', // In real app, hash this!
        role: 'admin',
        department: 'Administration'
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin user already exists.');
    }

    // Seed Rooms
    const roomCount = await Room.count();
    if (roomCount === 0) {
      const rooms = [];
      for (let b = 1; b <= 4; b++) {
        for (let r = 101; r <= 120; r++) {
          rooms.push({
            id: `B${b}-${r}`,
            block: `Block ${b}`,
            number: `${r}`,
            capacity: 6
          });
        }
      }
      await Room.bulkCreate(rooms);
      console.log(`Seeded ${rooms.length} rooms.`);
    } else {
      console.log('Rooms already seeded.');
    }

    console.log('Database seeding completed.');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
