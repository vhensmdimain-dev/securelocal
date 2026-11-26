-- Cristy's Home Street Food: database schema and starting data (SQLite / MySQL compatible)
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('product','ingredient')),
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  price REAL NOT NULL DEFAULT 0,       -- selling price per order (products only)
  per INTEGER NOT NULL DEFAULT 1,      -- pieces included in one order (e.g. 5 pesos per 3 pcs -> 3)
  qty REAL NOT NULL DEFAULT 0,         -- stock on hand
  low REAL NOT NULL DEFAULT 0          -- low-stock alert level
);
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_date TEXT NOT NULL,             -- YYYY-MM-DD
  sale_time TEXT NOT NULL,
  item_id INTEGER NOT NULL REFERENCES items(id),
  name TEXT NOT NULL,
  orders INTEGER NOT NULL,             -- number of orders sold
  pcs INTEGER NOT NULL,                -- pieces deducted from stock
  price REAL NOT NULL,
  total REAL NOT NULL
);
INSERT INTO items (id,type,name,unit,price,per,qty,low) VALUES
(1,'product','Kwek-kwek','pcs',5,1,80,20),
(2,'product','Turon','pcs',10,1,40,10),
(3,'product','Siomai','pcs',5,1,60,15),
(4,'product','Siopao','pcs',25,1,30,8),
(5,'product','Cheese Stick','pcs',5,3,60,15),
(6,'product','Kikiam','pcs',5,3,60,15),
(7,'product','Fishball','pcs',5,4,100,20),
(8,'product','Banana Cue','pcs',25,1,40,10),
(9,'product','French Fries','cups',20,1,30,8),
(10,'product','Ham & Cheese Empanada','pcs',5,1,30,8),
(11,'product','Dynamite','pcs',10,3,40,10),
(12,'product','Palamig','cups',10,1,50,12),
(13,'ingredient','Cooking oil','L',0,1,5,2),
(14,'ingredient','Flour','kg',0,1,3,1),
(15,'ingredient','Eggs','pcs',0,1,60,20),
(16,'ingredient','Sugar','kg',0,1,2,1),
(17,'ingredient','Potatoes','kg',0,1,5,2),
(18,'ingredient','Cheese','kg',0,1,2,1),
(19,'ingredient','Bamboo skewers','pcs',0,1,200,50),
(20,'ingredient','Cups','pcs',0,1,100,30);
-- Example queries
-- Daily income:   SELECT sale_date, SUM(total) FROM sales GROUP BY sale_date;
-- Low stock:      SELECT name, qty, unit FROM items WHERE qty <= low;
