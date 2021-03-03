const express = require("express");
const router = express.Router();
const { Client } = require("pg");

// Init Postgres
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: true })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // This bypasses the SSL verification

// Connect to Postgres 
client.connect(err => {
    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('songs API:', 'Connected to postgres db!')
    }
})

// GET all data from songs
router.get("/", async (req, res) => {
    try {
        const songs = await client.query('SELECT * FROM songs ORDER BY id ASC');
        res.status(201).json(songs.rows);
    } catch (err) {
        res.status(400).json({
            error: `${err})`,
        });
    }
});

// GET all data from songs for specific songID
router.get("/:id", async (req, res) => {
    try {
        const songs = await client.query(`SELECT * FROM songs WHERE id=${req.params.songid} ORDER BY id ASC`);
        res.status(201).json(songs.rows);
    } catch (err) {
        res.status(400).json({
            error: `${err})`,
        });
    }
});

// DELETE single songs (based on id)
router.delete("/:id", async (req, res) => {
    try {
      await client.query('DELETE FROM songs WHERE id=' + req.params.id);
      res.status(200).json({
        success: `Song #${req.params.id} has been deleted.`,
      });
    } catch (err) {
      res.status(400).json({
        error: `${err}`,
      });
    }
  });

// POST a new song to songs
router.post("/", async (req, res) => {
    const title = req.body.title ? req.body.title.replace("'", "") : null;
    const archived = req.body.archived ? req.body.archived : false;
    const insertSongQuery = `INSERT INTO songs (title, archived) VALUES ('${title}', ${archived})`;
    try {
      await client.query(insertSongQuery);
      res.status(201).json({ success: "Success" });
    } catch (err) {
      res.status(400).json({
        error: `${err})`
      });
    }
  });


// PATCH single song (based on id)
router.patch("/:id", async (req, res) => {

  let updateField = '';
  if (req.body.title) {
    updateField = updateField + "title='" + req.body.title + "',";
  }
  if (req.body.archived) {
    updateField = updateField + "archived='" + req.body.archived + "',";
  }
  const updateFieldEdited = updateField.slice(0, -1) // delete the last comma
  const updateQuery = 'UPDATE songs SET ' + updateFieldEdited + ' WHERE id=' + req.params.id;
  try {
    const song = await client.query(updateQuery);
    if (song.rowCount > 0) {
      res.status(200).json({
        success: `Song with id#${req.params.id} has been updated.`,
      });
    } else {
      res.status(400).json({
        error: `No song found with id#${req.params.id}`,
      });
    }
  } catch (err) {
    res.status(400).json({
      error: `${err}`,
    });
  }

});

module.exports = router;
