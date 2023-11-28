# Project_DBMS
This is for Cricket World Cup database management system. Tech Stacks used are React.js, Rust and PostgreSQL. Please make sure these are setup on your device. Use Rustup to install Rust/Cargo. Rustup is toolchain installer for Rust.
Database schema is stored in the darshil.sql file in the db_loader. Please execute it first to load the database.
Also change the constants in the .env file according to your device.
Write cd db_loader on the terminal and type cargo run to execute the code inside db_loader. This will load the data randomly inside the database for previous versions of the world cup.
After the data is loaded successfully, we will begin by starting the servers.
Write cd ../backend_dbms/ then cargo run to start the main server. Then cd websocket and cargo run to start the websocket server. Write cd ../auth-frontend and npm start to start the frontend server. We are good to go now!