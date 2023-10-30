
use std::env;
use std::hash::Hash;
use dotenv::dotenv;
use tokio_postgres::{Statement, Row, Client, NoTls};
use crate::{PageInfo, Score, Player, Venue};


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
pub async fn websoc () -> Result<PageInfo, tokio_postgres::Error> {

    let client = connect().await;
    dotenv().ok();
    let year: String = env::var("YEAR").expect("Year not set in dotenv");
    let mat_id = env::var("MATCH").expect("Match_id not set in dotenv");
    let year: i32 =   year.parse().unwrap();
    let mat_id: i32 = mat_id.parse().unwrap();
    println!("Year {} Match_id {}", &year, &mat_id);
    let s: Statement = client.prepare("Select team1, team2, venue_id FROM fixtures where year=$1 and match_id=$2").await.expect("Wrong SQL query to fetch for wsocket");
    let res: Vec<Row> = client.query(&s, &[&year, &mat_id]).await.expect("Error fetching the query for wsocket");
    let team1: String = res[0].get("team1");
    let team2: String = res[0].get("team2");
    let venue: i32 = res[0].get("venue_id");
    let ven_info: Vec<Row> = client.query("SELECT * from venue where venue_id=$1", &[&venue]).await.expect("Error fetching venue");
    let scor: Statement = client.prepare("SELECT run1, run2, ball1, ball2, wicket1, wicket2 from fixtures where year=$1 and match_id=$2").await.expect("Wrong score fetching query");
    let sc: Statement = client.prepare("SELECT * from scorecard where year=$1 and match_id=$2 and player_id=$3").await.expect("Wrong scorecard fetching query");
    let scor: Vec<Row> = client.query(&scor, &[&year, &mat_id]).await.expect("Error fetching scores");
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
        let scd: Vec<Row> = client.query(&sc, &[&year, &mat_id, &f.player_id]).await.expect("Error getting scorecard");
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
        let scd: Vec<Row> = client.query(&sc, &[&year, &mat_id, &f.player_id]).await.expect("Error getting scorecard");
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
        striker: 0,
        non_striker: 0,
        bowler: 0,
        cur_bat_team: "".to_string(),
    };
    Ok(pgi)
}