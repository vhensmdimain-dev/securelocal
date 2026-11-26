-- Cristy's Home Street Food: database schema and starting data (MySQL / MariaDB)

CREATE DATABASE IF NOT EXISTS cristy_street_food
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cristy_street_food;

-- This setup is safe to re-import: it does not drop existing business records.

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,   -- selling price per order (products only)
  per INT NOT NULL DEFAULT 1,               -- pieces included in one order (e.g. 5 pesos per 3 pcs -> 3)
  qty DECIMAL(10,2) NOT NULL DEFAULT 0,     -- stock on hand
  low DECIMAL(10,2) NOT NULL DEFAULT 0,     -- low-stock alert level
  CONSTRAINT chk_items_type CHECK (type IN ('product','ingredient'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_date DATE NOT NULL,                  -- YYYY-MM-DD
  sale_time VARCHAR(20) NOT NULL,
  item_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  orders INT NOT NULL,                      -- number of orders sold
  pcs INT NOT NULL,                         -- pieces deducted from stock
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_by INT NULL,                       -- account that recorded the sale; legacy entries may be NULL
  data_enc MEDIUMTEXT NULL,                  -- AES-256-GCM encrypted sale details and payment reference
  CONSTRAINT fk_sales_item FOREIGN KEY (item_id) REFERENCES items(id)
) ENGINE=InnoDB;

INSERT IGNORE INTO items (id,type,name,unit,price,per,qty,low) VALUES
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
