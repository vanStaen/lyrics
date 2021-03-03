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
        console.log('rows API:', 'Connected to postgres db!')
    }
})

// GET all data from rows
router.get("/", async (req, res) => {
    try {
        const rows = await client.query('SELECT * FROM rows ORDER BY  position ASC');
        res.status(201).json(rows.rows);
    } catch (err) {
        res.status(400).json({
            error: `${err})`,
        });
    }
});

// GET all data from rows for specific songID
router.get("/:songid", async (req, res) => {
    try {
        const rows = await client.query(`SELECT * FROM rows WHERE songid=${req.params.songid} ORDER BY position ASC`);
        res.status(201).json(rows.rows);
    } catch (err) {
        res.status(400).json({
            error: `${err})`,
        });
    }
});

// DELETE single rows (based on id)
router.delete("/:id", async (req, res) => {
    try {
      const rows = await client.query('DELETE FROM rows WHERE id=' + req.params.id);
      res.status(200).json({
        success: `Row #${req.params.id} has been deleted.`,
      });
    } catch (err) {
      res.status(400).json({
        error: `${err}`,
      });
    }
  });

// POST a new row to rows
router.post("/", async (req, res) => {
    const text = req.body.text ? req.body.text.replace("'", "") : null;
    const position = req.body.position ? req.body.position : 0;
    const tab = req.body.tab ? req.body.tab : false;
    const songid = req.body.songid ? req.body.songid : null;
    const insertRowQuery = `INSERT INTO rows (text, position, tab, songid) VALUES ('${text}', ${position}, ${tab}, ${songid})`;
    try {
      await client.query(insertRowQuery);
      res.status(201).json({ success: "Success" });
    } catch (err) {
      res.status(400).json({
        error: `${err})`
      });
    }
  });


// PATCH single row (based on id)
router.patch("/:id", async (req, res) => {

  let updateField = '';
  if (req.body.text) {
    updateField = updateField + "text='" + req.body.text + "',";
  }
  if (req.body.position) {
    updateField = updateField + "position='" + req.body.position + "',";
  }
  if (req.body.tab !== undefined) {
    updateField = updateField + "tab='" + req.body.tab + "',";
  }
  if (req.body.songid) {
    updateField = updateField + "songid='" + req.body.songid + "',";
  }
  const updateFieldEdited = updateField.slice(0, -1) // delete the last comma
  const updateQuery = 'UPDATE rows SET ' + updateFieldEdited + ' WHERE id=' + req.params.id;
  try {
    const rows = await client.query(updateQuery);
    if (rows.rowCount > 0) {
      res.status(200).json({
        success: `Row with id#${req.params.id} has been updated.`,
      });
    } else {
      res.status(400).json({
        error: `No row found with id#${req.params.id}`,
      });
    }
  } catch (err) {
    res.status(400).json({
      error: `${err}`,
    });
  }

});

module.exports = router;
