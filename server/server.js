const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
require('dotenv').config()

app.use(cors());
app.use(express.json());



app.get("/", async (req, res) => { //serach feature with sql like
    let polices;
  try {
    const { search } = req.query;
    if(search){
        policies = await pool.query(
            "SELECT * FROM policy WHERE policy_id || ' ' || customer_id ILIKE $1",
            [`%${search}%`]
          );
    }
    else{
      const { page } = req.query;
        policies = await pool.query("SELECT * FROM policy ");
    }
        res.json(policies.rows);
  } catch (err) {
        console.error(err.message);
  }
});

app.get("/graph", async (req, res) => { // graph feature with joins and count operation
    try {
        const { region } = req.query;
      const graph = await pool.query("SELECT date_part('month', date_of_purchase) AS txn_month, count(*) as count FROM policy LEFT JOIN customer ON (policy.policy_id = customer.policy_id) where customer.customer_region=$1 GROUP BY txn_month ",[region]);
      res.json(graph.rows);
    } catch (err) {
      console.error(err.message);
    }
  });



app.get("/policy/:id", async (req, res) => { //specific policy detail
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM policy WHERE policy_id = $1", [
      id
    ]);
    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});



app.put("/policy/:id", async (req, res) => { //edit policy
  try {
    const { id } = req.params;
    const { vehicle_segment, property_damage_liability, premium, personal_injury_protection, fuel,comprehensive, collision, bodily_injury_liability} = req.body
    const updateTodo = await pool.query(
      "UPDATE policy SET vehicle_segment = $1,property_damage_liability = $2,premium = $3,personal_injury_protection = $4,fuel = $5,comprehensive = $6,collision = $7,bodily_injury_liability = $8 WHERE policy_id = $9",
      [vehicle_segment,property_damage_liability,premium,personal_injury_protection,fuel,comprehensive,collision,bodily_injury_liability, id]
    );

    res.json("Policy is updated!");
  } catch (err) {
    console.error(err.message);
  }
});

const port=5000

app.listen(port, () => {
  console.log(`server has started on port ${port}`);
});