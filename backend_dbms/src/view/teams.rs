use actix_web::{get, HttpResponse, web};
use serde_derive::Serialize;
use tokio_postgres::{Error, Row, Statement};

#[derive(Serialize)]
pub struct Player {
    pub year: i32,
    pub player_id: i32,
    pub name: String,
    pub player_type: String,
    pub player_seq: i32,
    pub hand: String,
    pub captain: bool,
    pub country: String,
}
impl From<Row> for Player {
    fn from(value: Row) -> Self {
        Player {
            year: value.get("year"),
            player_id: value.get("player_id"),
            name: value.get("player_name"),
            player_type: value.get("player_type"),
            player_seq: value.get("player_seq"),
            hand: value.get("hand"),
            captain: value.get("captain"),
            country: value.get("country"),
        }
    }
}
#[get("/teams/{year}/{country}")]
pub async fn fetch_teams(path: web::Path<(i32, String)>) -> Result<HttpResponse, actix_web::Error> {
    let (year, country) = path.into_inner();
    let client = crate::auth::register::connect().await;
    let s: Statement = client.prepare("SELECT * from player where year=$1 and country=$2;").await.expect("Wrong player fetching query");
    let mut res: Vec<Row> = vec![];
    match client.query(&s, &[&year, &country]).await {
        Ok(t) => {res=t;}
        Err(_) => {

        }
    };
    let mut js: Vec<Player> = res.into_iter().map(Player::from).collect();
    for i in &mut js {
        if i.captain == true {
            i.name = format!("{} (C)",i.name);
        }
        if i.player_type == "Wicket-keeper" {
            i.name = format!("{} (Wk)", i.name);
        }
    }
    Ok(HttpResponse::Ok().json(js))
}