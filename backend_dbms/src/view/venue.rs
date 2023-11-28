use std::task::ready;
use actix_web::{get, HttpResponse};
use serde_derive::Serialize;
use tokio_postgres::{Row, Statement};

#[derive(Serialize)]
pub struct Resp {
    venue_id: i32,
    name: String,
    city: String,
    country: String,
    capacity: i32,
}
impl From<Row> for Resp {
    fn from(value: Row) -> Self {
        Resp {
            venue_id: value.get("venue_id"),
            name: value.get("name"),
            city: value.get("city"),
            country: value.get("country"),
            capacity: value.get("capacity"),
        }
    }
}
#[get("/venues/{year}")]
pub async fn fetch_venue(path: actix_web::web::Path<i32>) -> Result<HttpResponse, actix_web::Error> {
    let year = path.into_inner();
    let client = crate::auth::register::connect().await;
    let s: Statement = client.prepare("SELECT v.*
        FROM venue v
        WHERE v.country IN (
            SELECT yh.host
            FROM year_host yh
            WHERE yh.year = $1
        );").await.expect("Wrong venue fetching query");
    let resp: Vec<Row> = client.query(&s, &[&year]).await.expect("Error fetching venues");
    let resp_json: Vec<Resp> = resp.into_iter().map(Resp::from).collect();
    Ok(HttpResponse::Ok().json(resp_json))
}