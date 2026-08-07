const prisma = require('./src/config/db');
prisma.event.findMany().then(res => {
  console.log('Success:', res.length);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
