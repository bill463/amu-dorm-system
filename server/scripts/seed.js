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
        for (let f = 1; f <= 4; f++) {
          for (let r = 1; r <= 16; r++) {
            // Room number construction: 101, 102... 201, 202...
            // Use padStart to ensure 01, 02 for single digits if needed, but per request "16 rooms"
            // Usually standard is 101-116.
            const roomNum = `${f}${r.toString().padStart(2, '0')}`;
            rooms.push({
              id: `B${b}-${roomNum}`,
              block: `Block ${b}`,
              number: roomNum,
              capacity: 6
            });
          }
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
