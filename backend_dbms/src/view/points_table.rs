use actix_web::{get, HttpResponse, web};
use serde_derive::Serialize;

#[derive(Serialize, Debug)]
pub struct Teams {
    pub year: i32,
    pub team_playing: String,
    pub group_char: String,
    pub champions: bool,
    pub runner: bool,
    pub won: i32,
    pub lost: i32,
    pub draw: i32,
}
#[get("/table/{year}")]
pub async fn fetch_pt(path: web::Path<(i32)>) -> Result<HttpResponse, actix_web::Error> {
    let client = crate::auth::register::connect().await;
    let year: i32 = path.into_inner();
    let rows = client
        .query("SELECT * FROM teams where year=$1 order by won+draw DESC", &[&year])
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(e)
        })?;
    let teams: Vec<Teams> = rows.iter().map(|row| Teams{
        year: row.get("year"),
        team_playing: row.get("team_playing"),
        group_char: row.get("group_char"),
        champions: row.get("champions"),
        runner: row.get("runner"),
        won: row.get("won"),
        lost: row.get("lost"),
        draw: row.get("draw")
    }).collect();
    Ok(HttpResponse::Ok().json(teams))
}