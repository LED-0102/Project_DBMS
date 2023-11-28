use actix_web::{get, HttpResponse, web};
use tokio_postgres::{Statement, Row};
use serde_derive::Serialize;

#[derive(Serialize, Clone)]
pub struct PageInfo {
    pub json_id: i32,
    pub team1: Score,
    pub team2: Score,
    pub player1: Vec<Player>,
    pub player2: Vec<Player>,
    pub venue: Venue,
}
#[derive(Serialize, Clone)]
pub struct Overs{
    pub year: i32,
    pub match_id: i32,
    pub over_number: i32,
    pub bowler: i32,
    pub striker: i32,
    pub non_striker: i32,
    pub figures: String,
    pub num_ball: i32,
}
impl Overs {
    fn new() -> Overs {
        Overs{
            year: dotenv::var("YEAR").unwrap().parse().unwrap(),
            match_id: dotenv::var("MATCH").unwrap().parse().unwrap(),
            over_number: 0,
            bowler: 0,
            striker: 0,
            non_striker: 0,
            figures: "".to_string(),
            num_ball: 0,
        }
    }
}
impl PageInfo {
    fn new() -> PageInfo {
        PageInfo{
            json_id: 1,
            team1: Score::new(),
            team2: Score::new(),
            player1: vec![],
            player2: vec![],
            venue: Venue::new(),
        }
    }
}
#[derive(Clone, Serialize)]
pub struct Score {
    pub team: String,
    pub runs: i32,
    pub wickets: i32,
    pub overs: i32,
}
impl Score {
    fn new() -> Score {
        Score{
            team: "".to_string(),
            runs: 0,
            wickets: 0,
            overs: 0,
        }
    }
}
#[derive(Eq, Hash, PartialEq, Serialize, Clone)]
pub struct Player {
    pub player_id: i32,
    pub name: String,
    pub player_seq: i32,
    pub player_type: String,
    pub hand: String,
    pub captain: bool,
    pub country: String,
    pub runs_scored: i32,
    pub four_bat: i32,
    pub six_bat : i32,
    pub balls_faced: i32,
    pub balls_bowled: i32,
    pub runs_conceded: i32,
    pub wickets: i32,
    pub nb: i32,
    pub lb: i32,
    pub wd: i32,
    pub out: bool,
    pub got_out: bool,
}
impl Player {
    fn new () -> Player {
        Player{
            player_id: 0,
            name: "".to_string(),
            player_seq: 0,
            player_type: "".to_string(),
            hand: "".to_string(),
            captain: false,
            country: "".to_string(),
            runs_scored: 0,
            four_bat: 0,
            six_bat: 0,
            balls_faced: 0,
            balls_bowled: 0,
            runs_conceded: 0,
            wickets: 0,
            nb: 0,
            lb: 0,
            wd: 0,
            out: false,
            got_out: false,
        }
    }
}
#[derive(Serialize, Clone)]
pub struct Venue {
    pub venue_id: i32,
    pub venue_name: String,
    pub city: String,
    pub country: String,
    pub capacity: i32
}
impl Venue {
    fn new () -> Venue {
        Venue{
            venue_id: 0,
            venue_name: "".to_string(),
            city: "".to_string(),
            country: "".to_string(),
            capacity: 0,
        }
    }
}

#[get("/match/{year}/{match_id}")]
pub async fn fetch_match(path: web::Path<(i32, i32)>) -> Result<HttpResponse, actix_web::Error> {
    let (year, match_id) = path.into_inner();
    let client= crate::auth::register::connect().await;
    println!("Year {} Match_id {}", &year, &match_id);
    let s: Statement = client.prepare("Select team1, team2, venue_id FROM fixtures where year=$1 and match_id=$2").await.expect("Wrong SQL query to fetch for wsocket");
    let res: Vec<Row> = client.query(&s, &[&year, &match_id]).await.expect("Error fetching the query for wsocket");
    let team1: String = res[0].get("team1");
    let team2: String = res[0].get("team2");
    let venue: i32 = res[0].get("venue_id");
    let ven_info: Vec<Row> = client.query("SELECT * from venue where venue_id=$1", &[&venue]).await.expect("Error fetching venue");
    let scor: Statement = client.prepare("SELECT run1, run2, ball1, ball2, wicket1, wicket2 from fixtures where year=$1 and match_id=$2").await.expect("Wrong score fetching query");
    let sc: Statement = client.prepare("SELECT * from scorecard where year=$1 and match_id=$2 and player_id=$3").await.expect("Wrong scorecard fetching query");
    let scor: Vec<Row> = client.query(&scor, &[&year, &match_id]).await.expect("Error fetching scores");
    let sc1: Score = Score{
        team: team1.to_string(),
        runs: scor[0].get("run1"),
        wickets: scor[0].get("wicket1"),
        overs: scor[0].get("ball1"),
    };
    let sc2: Score = Score{
        team: team2.to_string(),
        runs: scor[0].get("run2"),
        wickets: scor[0].get("wicket2"),
        overs: scor[0].get("ball2"),
    };
    let p: Statement = client.prepare("SELECT * from player where year=$1 and country=$2").await.expect("Wrong team fetching query");
    let plt1: Vec<Row> = client.query(&p, &[&year, &team1]).await.expect("Error getting team1 players");
    let plt2: Vec<Row> = client.query(&p, &[&year, &team2]).await.expect("Error fetching team2 players");
    let mut p1: Vec<Player> = Vec::new();
    let mut p2: Vec<Player> = Vec::new();
    for i in &plt1 {
        let mut f: Player = Player {
            player_id: i.get("player_id"),
            name: i.get("player_name"),
            player_seq: i.get("player_seq"),
            player_type: i.get("player_type"),
            hand: i.get("hand"),
            captain: i.get("captain"),
            country: i.get("country"),
            runs_scored: 0,
            four_bat: 0,
            six_bat: 0,
            balls_faced: 0,
            balls_bowled: 0,
            runs_conceded: 0,
            wickets: 0,
            nb: 0,
            lb: 0,
            wd: 0,
            out: false,
            got_out: false,
        };
        let scd: Vec<Row> = client.query(&sc, &[&year, &match_id, &f.player_id]).await.expect("Error getting scorecard");
        f.runs_scored= scd[0].get("runs_scored");
        f.player_seq= scd[0].get("player_seq");
        f.four_bat= scd[0].get("four_bat");
        f.six_bat= scd[0].get("six_bat");
        f.balls_faced= scd[0].get("balls_faced");
        f.balls_bowled= scd[0].get("balls_bowled");
        f.runs_conceded= scd[0].get("runs_conceded");
        f.wickets= scd[0].get("wickets");
        f.nb= scd[0].get("nb");
        f.lb= scd[0].get("lb");
        f.out= scd[0].get("out");
        f.wd= scd[0].get("wd");
        p1.push(f);
    }
    for i in &plt2 {
        let mut f: Player = Player {
            player_id: i.get("player_id"),
            name: i.get("player_name"),
            player_seq: i.get("player_seq"),
            player_type: i.get("player_type"),
            hand: i.get("hand"),
            captain: i.get("captain"),
            country: i.get("country"),
            runs_scored: 0,
            four_bat: 0,
            six_bat: 0,
            balls_faced: 0,
            balls_bowled: 0,
            runs_conceded: 0,
            wickets: 0,
            nb: 0,
            lb: 0,
            wd: 0,
            out: false,
            got_out: false,
        };
        let scd: Vec<Row> = client.query(&sc, &[&year, &match_id, &f.player_id]).await.expect("Error getting scorecard");
        f.runs_scored= scd[0].get("runs_scored");
        f.player_seq= scd[0].get("player_seq");
        f.four_bat= scd[0].get("four_bat");
        f.six_bat= scd[0].get("six_bat");
        f.balls_faced= scd[0].get("balls_faced");
        f.balls_bowled= scd[0].get("balls_bowled");
        f.runs_conceded= scd[0].get("runs_conceded");
        f.wickets= scd[0].get("wickets");
        f.nb= scd[0].get("nb");
        f.lb= scd[0].get("lb");
        f.out= scd[0].get("out");
        f.wd= scd[0].get("wd");
        p2.push(f);
    }
    let pgi: PageInfo = PageInfo{
        json_id: 1,
        team1: sc1,
        team2: sc2,
        player1: p1,
        player2: p2,
        venue: Venue{
            venue_id: ven_info[0].get("venue_id"),
            venue_name: ven_info[0].get("name"),
            city: ven_info[0].get("city"),
            country: ven_info[0].get("country"),
            capacity: ven_info[0].get("capacity"),
        },
    };
    Ok(HttpResponse::Ok().json(pgi))
}