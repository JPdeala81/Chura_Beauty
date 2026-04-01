const bcrypt = require('bcryptjs');

const password = 'Admin@Chura2024!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Generated hash:');
    console.log(hash);
  }
});
