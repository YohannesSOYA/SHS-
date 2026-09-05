const sqlite3 = require('./server/node_modules/sqlite3').verbose();
const db = new sqlite3.Database('./server/school.db');

db.serialize(() => {
  // Fix admin name
  db.run("UPDATE users SET name = 'Pentadbiran SMK Sacred Heart' WHERE username = 'admin'", function(err) {
    if (err) console.error('Error updating admin:', err);
    else console.log('Admin name updated, rows affected:', this.changes);
  });

  // Check and fix slogan
  db.get("SELECT * FROM settings LIMIT 1", (err, row) => {
    if (err) { console.error('Settings error:', err); return; }
    if (row) {
      console.log('Current slogan:', row.slogan);
      if (row.slogan && row.slogan.includes('Lundu')) {
        db.run("UPDATE settings SET slogan = 'Berdoa Serta Berusaha - SMK Sacred Heart' WHERE id = 1", function(e) {
          if (!e) console.log('Slogan updated!');
        });
      }
    }
  });

  db.get("SELECT name FROM users WHERE username = 'admin'", (err, row) => {
    if (row) console.log('Verified admin name:', row.name);
    db.close();
    console.log('Done.');
  });
});
