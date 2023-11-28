use actix_web::{get, HttpResponse};
use serde_derive::Serialize;
use tokio_postgres::Row;

pub struct Resp {
    year: i32,
    hosting_country: String,
    winning_team: String,
    runner_up_team: String
}
#[derive(Serialize)]
pub struct RespJson {
    year: i32,
    hosting_country: String,
    winning_team: String,
    runner_up_team: String
}
impl From<Row> for Resp {
    fn from(value: Row) -> Self {
        Resp{
            year: value.get("year"),
            hosting_country: value.get("host_country"),
            winning_team: value.get("champion_country"),
            runner_up_team: value.get("runner_country"),
        }
    }
}
#[get("/archive")]
pub async fn fetch_archive() -> Result<HttpResponse, actix_web::Error> {
    let client = crate::auth::register::connect().await;
    let rows = client
        .query("SELECT y.year,
                   yh.host AS host_country,
                   t1.team_playing AS champion_country,
                   t2.team_playing AS runner_country
            FROM years y
            JOIN year_host yh ON y.year = yh.year
            JOIN teams t1 ON y.year = t1.year AND t1.champions = true
            JOIN teams t2 ON y.year = t2.year AND t2.runner = true ORDER by year;
            ", &[])
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(e)
        })?;
    let mut resp: Vec<Resp> = rows.into_iter().map(Resp::from).collect();
    let mut resp_json: Vec<RespJson> = vec![];
    'outer: for i in &resp {
        for j in & mut resp_json {
            if j.year == i.year {
                j.hosting_country=format!("{}, {}", j.hosting_country, i.hosting_country);
                continue 'outer;
            }
        }
        resp_json.push(RespJson {
            year: i.year,
            hosting_country: i.hosting_country.clone(),
            winning_team: i.winning_team.clone(),
            runner_up_team: i.runner_up_team.clone(),
        });
    }
    Ok(HttpResponse::Ok().json(resp_json))
}