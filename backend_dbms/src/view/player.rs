use actix_web::{HttpResponse, Error, get, web};
use serde_derive::Serialize;
#[derive(Serialize, Debug)]
pub struct Player {
    pub year: i32,
    pub player_id: i32,
    pub name: String,
    pub player_type: String,
    pub player_seq: i32,
    pub hand: String,
    pub captain: bool,
    pub country: String,
    pub run: i64,
    pub six: i64,
    pub four: i64,
    pub ball_faced: i64,
    pub balls_bowled: i64,
    pub runs_conceded: i64,
    pub wickets: i64,
}

#[get("/player/{year}/{player_id}")]
pub async fn fetch_player(path: web::Path<(i32, i32)>) -> Result<HttpResponse, Error>{
    let client = crate::auth::register::connect().await;
    let (year, player_id): (i32, i32) = path.into_inner();
    let rows = client
        .query("SELECT * FROM player WHERE player_id=$1 and year=$2", &[&player_id, &year])
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(e)
        })?;
    let ot = client.query("SELECT sum(runs_scored), sum(four_bat), sum(six_bat), sum(balls_faced), sum(wickets), sum(balls_bowled), sum(runs_conceded) from scorecard where year=$1 and player_id=$2", &[&year, &player_id]).await.map_err(|e| {
        actix_web::error::ErrorInternalServerError(e)
    })?;
    let player: Vec<Player> = rows.iter().zip(ot.iter()).map(|(row, ot_ele)| Player{
        year: row.get("year"),
        player_id: row.get("player_id"),
        name: row.get("player_name"),
        player_type: row.get("player_type"),
        player_seq: row.get("player_seq"),
        hand: row.get("hand"),
        captain: row.get("captain"),
        country: row.get("country"),
        run: ot_ele.get(0),
        six: ot_ele.get(2),
        four: ot_ele.get(1),
        ball_faced: ot_ele.get(3),
        wickets: ot_ele.get(4),
        balls_bowled: ot_ele.get(5),
        runs_conceded: ot_ele.get(6)
    }).collect();
    Ok(HttpResponse::Ok().json(player))
}