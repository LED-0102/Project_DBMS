use actix_web::{get, HttpResponse};
use crate::view::archive::Resp;

#[derive(serde_derive::Serialize, Debug)]
struct Fixture {
    year: i32,
    match_id: i32,
    team1: String,
    team2: String,
    venue_id: i32,
    venue: String,
    run1: i32,
    wicket1: i32,
    wicket2: i32,
    run2: i32,
    ball1: i32,
    ball2: i32,
    winner: String,
    city: String
}
#[get("/fixtures/{year}")]
pub(crate) async fn fetch_fixtures(path: actix_web::web::Path<i32>) -> Result<HttpResponse, actix_web::Error> {
    let client = crate::auth::register::connect().await;
    let year = path.into_inner();
    let query = "
        SELECT f.year, f.match_id, f.team1, f.team2, f.venue_id, v.name AS venue, f.run1, f.wicket1, f.wicket2, f.run2, f.ball1, f.ball2, f.winner, v.city as city
        FROM fixtures f
        JOIN venue v ON f.venue_id = v.venue_id
        WHERE f.year = $1
        ORDER BY f.match_id ASC
    ";

    let rows = client
        .query(query, &[&year])
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(e)
        })?;

    let mut fixtures: Vec<Fixture> = rows
        .iter()
        .map(|row| {
            let winner: Result<String, tokio_postgres::Error> = row.try_get("winner");
            let winner_value = winner.unwrap_or_else(|_| "".to_string());
            Fixture {
                year: row.get("year"),
                match_id: row.get("match_id"),
                team1: row.get("team1"),
                team2: row.get("team2"),
                venue_id: row.get("venue_id"),
                venue: row.get("venue"),
                city: row.get("city"),
                run1: row.get("run1"),
                wicket1: row.get("wicket1"),
                wicket2: row.get("wicket2"),
                run2: row.get("run2"),
                ball1: row.get("ball1"),
                ball2: row.get("ball2"),
                winner: winner_value,
            }
        })
        .collect();

    // Sorting fixtures based on match_id (ascending order)
    fixtures.sort_by(|a, b| {
        if a.match_id >= 0 && b.match_id >= 0 {
            a.match_id.cmp(&b.match_id)
        } else if a.match_id >= 0 && b.match_id < 0 {
            std::cmp::Ordering::Less
        } else if a.match_id < 0 && b.match_id >= 0 {
            std::cmp::Ordering::Greater
        } else {
            a.match_id.cmp(&b.match_id)
        }
    });

    Ok(HttpResponse::Ok().json(fixtures))
}


