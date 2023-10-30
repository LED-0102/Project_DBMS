use bcrypt::{DEFAULT_COST, hash, verify};
use tokio_postgres::{Client, NoTls, Row};
use serde_derive::Deserialize;
use tokio;
use dotenv::dotenv;
use std::env;
use actix_web::{web, HttpResponse, Responder};
use std::error::Error;
#[derive(Clone, Deserialize)]
pub struct NewUser {
    pub username: String,
    pub password: String,
}
pub struct User {
    pub username: String,
    pub password: String,
}

impl NewUser {
    pub fn new (username: String, password: String) -> NewUser {
        let hashed_password: String = hash (password.as_str(), DEFAULT_COST).unwrap();
        return NewUser {
            username,
            password: hashed_password,
        }
    }
}
impl User {
    pub fn verify(&self, password: String) -> bool {
        verify(password.as_str(), &self.password).unwrap()
    }
}
impl From<Row> for User {
    fn from(value: Row) -> Self {
        User{
            username: value.get("user_name"),
            password: value.get("password"),
        }
    }
}
pub async fn connect() ->  Client {
    dotenv().ok();
    let user = env::var("USER").expect("User not set in .env");
    let password = env::var("PASSWORD").expect("Password not set for User in .env");
    let dbname = env::var("DBNAME").expect("Database name not set in .env");

    let config = format!("host=localhost user={} password={} dbname = {}", user, password, dbname);
    let (client, connection) = tokio_postgres::connect(
        &config, NoTls
    ).await.unwrap();
    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });
    client
}
pub async fn insert( st: NewUser) -> Result<(), Box<dyn Error>> {
    let client: &Client = &connect().await;
    client.execute("INSERT INTO users (user_name, password, admin) VALUES ($1, $2, false)", &[&st.username, &st.password ]).await?;
    println!("Inserted");
    Ok(())
}
pub async fn register (new_user: web::Json<NewUser>) -> impl Responder {
    println!("Got here");
    let new_user = NewUser::new(
        new_user.username.clone(),
        new_user.password.clone(),
    );
    println!("{} {}", new_user.password, new_user.username);
    match insert(new_user).await {
        Ok(_) => {
            println!("Created");
            HttpResponse::Created()
        },
        Err(_) => {
            println!("Conflict");
            HttpResponse::Conflict()
        }
    }
}