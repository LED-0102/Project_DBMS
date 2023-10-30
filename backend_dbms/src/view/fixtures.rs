use actix_web::{web, App, HttpServer, HttpResponse};

#[derive(serde_derive::Serialize, Debug)]
struct Fixture {
    year: i32,
    match_id: i32,
    team1: String,
    team2: String,
    venue_id: i32,
    run1: i32,
    wicket1: i32,
    wicket2: i32,
    run2: i32,
    ball1: i32,
    ball2: i32,
}

pub(crate) async fn fetch_fixtures() -> Result<HttpResponse, actix_web::Error> {
    let client = crate::auth::register::connect().await;

    let rows = client
        .query("SELECT * FROM fixtures WHERE year=2023 ORDER BY match_id ASC", &[])
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(e)
        })?;

    let mut fixtures: Vec<Fixture> = rows
        .iter()
        .map(|row| Fixture {
            year: row.get("year"),
            match_id: row.get("match_id"),
            team1: row.get("team1"),
            team2: row.get("team2"),
            venue_id: row.get("venue_id"),
            run1: row.get("run1"),
            wicket1: row.get("wicket1"),
            wicket2: row.get("wicket2"),
            run2: row.get("run2"),
            ball1: row.get("ball1"),
            ball2: row.get("ball2"),
        })
        .collect();

    // Sorting fixtures based on match_id (ascending order)
    fixtures.sort_by(|a, b| {
        if a.match_id >= 0 && b.match_id >= 0 {
            a.match_id.cmp(&b.match_id)  // Sort natural numbers in ascending order
        } else if a.match_id >= 0 && b.match_id < 0 {
            std::cmp::Ordering::Less  // Place natural numbers before negative numbers
        } else if a.match_id < 0 && b.match_id >= 0 {
            std::cmp::Ordering::Greater  // Place negative numbers after natural numbers
        } else {
            a.match_id.cmp(&b.match_id)  // Sort negative numbers in ascending order
        }
    });
    // println!("{:?}", &fixtures);

    Ok(HttpResponse::Ok().json(fixtures))
}

