mod wst;
mod websocket;
mod db;

#[macro_use]
use std::error::Error;
use std::sync::{Mutex, MutexGuard};
use dotenv::dotenv;
use lazy_static::lazy_static;
use crate::wst::{WS};
use serde_derive::Serialize;
use crate::websocket::websoc;
use tokio::runtime::Runtime;

pub type Res<T> = Result<T, Box<dyn Error>>;
#[derive(Serialize, Clone)]
pub struct PageInfo {
    pub json_id: i32,
    pub team1: Score,
    pub team2: Score,
    pub player1: Vec<Player>,
    pub player2: Vec<Player>,
    pub venue: Venue,
    pub striker: i32,
    pub non_striker: i32,
    pub bowler: i32,
    pub cur_bat_team: String,
    pub match_status: bool,
    pub over: Overs,
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
            striker: 0,
            non_striker: 0,
            bowler: 0,
            cur_bat_team: "".to_string(),
            match_status: true,
            over: Overs::new(),
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
lazy_static!{
    pub static ref PAGEINFO: Mutex<PageInfo> = {
        Mutex::new(PageInfo::new())
    };
    pub static ref OVERS: Mutex<Overs> = {
        Mutex::new(Overs::new())
    };
}
fn main() {
    let mut pgi: PageInfo = PageInfo::new();
    let rt = Runtime::new().unwrap();
    rt.block_on(async{
        pgi = websoc().await.unwrap();
    });
    {
        let mut cur_state = PAGEINFO.lock().unwrap();
        cur_state.team1 = pgi.team1;
        cur_state.team2 = pgi.team2;
        cur_state.json_id = 1;
        cur_state.player1 = pgi.player1;
        cur_state.player2 = pgi.player2;
        cur_state.venue = pgi.venue;
        cur_state.cur_bat_team = cur_state.team1.team.clone();
    }
    println!("Set PAGEINFO complete");
    WS::init("localhost:8000").unwrap();
}