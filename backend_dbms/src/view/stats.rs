use actix_web::{HttpResponse, Error, get, web};
use serde_derive::Serialize;
use tokio_postgres::{Row};

#[derive(Serialize, Debug)]
pub struct List4 {
    pub year: i32,
    pub player_id: i32,
    pub name: String,
    pub player_type: String,
    pub country: String,
    pub four: i64,
    pub balls_faced: i64,
}
#[derive(Serialize, Debug)]
pub struct List6 {
    pub year: i32,
    pub player_id: i32,
    pub name: String,
    pub player_type: String,
    pub country: String,
    pub six: i64,
    pub balls_faced: i64,
}
#[derive(Serialize, Debug)]
pub struct Listr {
    pub year: i32,
    pub player_id: i32,
    pub name: String,
    pub player_type: String,
    pub country: String,
    pub run: i64,
    pub balls_faced: i64,
}
#[derive(Serialize, Debug)]
pub struct Listw {
    pub year: i32,
    pub player_id: i32,
    pub name: String,
    pub player_type: String,
    pub country: String,
    pub balls_bowled: i64,
    pub wickets: i64,
}
#[derive(Serialize, Debug)]
pub struct Final {
    pub runs: Vec<Listr>,
    pub wickets: Vec<Listw>,
    pub four: Vec<List4>,
    pub six: Vec<List6>,
}
#[get("/stats/{year}")]
pub async fn fetch_stat(path: web::Path<(i32)>) -> Result<HttpResponse, Error>{
    let client = crate::auth::register::connect().await;
    let year = path.into_inner();
    let lsr = client.query("select player_id, SUM(runs_scored) AS top_runs, SUM(balls_faced) AS tot_balls from scorecard where year=$1 group by player_id order by top_runs DESC LIMIT 20", &[&year]).await.map_err(|e| {
        actix_web::error::ErrorInternalServerError(e)
    })?;
    let mut lsr_vec: Vec<Listr> = vec![];
    for x in lsr {
        let pid: i32 = x.get("player_id");
        let player_info: Vec<Row> = client.query("select player_name, player_type, country from player where year=$1 and player_id=$2", &[&year, &pid]).await.expect("Error fetching player_info");
        lsr_vec.push( Listr {
            year,
            player_id: x.get("player_id"),
            run: x.get("top_runs"),
            balls_faced: x.get("tot_balls"),
            name: player_info[0].get("player_name"),
            player_type: player_info[0].get("player_type"),
            country: player_info[0].get("country"),
        });
    }


    let lsw = client.query("select player_id, SUM(wickets) AS top_runs, SUM(balls_bowled) AS tot_balls from scorecard where year=$1 group by player_id order by top_runs DESC LIMIT 20", &[&year]).await.map_err(|e| {
        actix_web::error::ErrorInternalServerError(e)
    })?;
    let mut lsw_vec: Vec<Listw> = vec![];
    for x in lsw {
        let pid: i32 = x.get("player_id");
        let player_info: Vec<Row> = client.query("select player_name, player_type, country from player where year=$1 and player_id=$2", &[&year, &pid]).await.expect("Error fetching player_info");
        lsw_vec.push( Listw {
            year,
            player_id: x.get("player_id"),
            wickets: x.get("top_runs"),
            balls_bowled: x.get("tot_balls"),
            name: player_info[0].get("player_name"),
            player_type: player_info[0].get("player_type"),
            country: player_info[0].get("country"),
        });
    }


    let lsf = client.query("select player_id, SUM(four_bat) AS top_runs, SUM(balls_faced) as tot_balls from scorecard where year=$1 group by player_id order by top_runs DESC LIMIT 20", &[&year]).await.map_err(|e| {
        actix_web::error::ErrorInternalServerError(e)
    })?;
    let mut ls4_vec: Vec<List4> = vec![];
    for x in lsf {
        let pid: i32 = x.get("player_id");
        let player_info: Vec<Row> = client.query("select player_name, player_type, country from player where year=$1 and player_id=$2", &[&year, &pid]).await.expect("Error fetching player_info");
        ls4_vec.push( List4 {
            year,
            player_id: x.get("player_id"),
            four: x.get("top_runs"),
            balls_faced: x.get("tot_balls"),
            name: player_info[0].get("player_name"),
            player_type: player_info[0].get("player_type"),
            country: player_info[0].get("country"),
        });
    }


    let lss = client.query("select player_id, SUM(six_bat) AS top_runs, SUM(balls_faced) as tot_balls from scorecard where year=$1 group by player_id order by top_runs DESC LIMIT 20", &[&year]).await.map_err(|e| {
        actix_web::error::ErrorInternalServerError(e)
    })?;
    let mut ls6_vec: Vec<List6> = vec![];
    for x in lss {
        let pid: i32 = x.get("player_id");
        let player_info: Vec<Row> = client.query("select player_name, player_type, country from player where year=$1 and player_id=$2", &[&year, &pid]).await.expect("Error fetching player_info");
        ls6_vec.push( List6 {
            year,
            player_id: x.get("player_id"),
            six: x.get("top_runs"),
            balls_faced: x.get("tot_balls"),
            name: player_info[0].get("player_name"),
            player_type: player_info[0].get("player_type"),
            country: player_info[0].get("country"),
        });
    }
    let fnl: Final = Final{
        runs: lsr_vec,
        wickets: lsw_vec,
        four: ls4_vec,
        six: ls6_vec
    };
    Ok(HttpResponse::Ok().json(fnl))
}