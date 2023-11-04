use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
use serde_derive::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::string::String;
use ws::{CloseCode, Error, Handshake, listen, Message, Sender};
use crate::{Overs, Res};
use crate::{PageInfo, OVERS};
use jsonwebtoken::{ decode, DecodingKey, Validation};
use tokio::runtime::Runtime;
use crate::db::process_json;
use tokio_postgres::{Statement, Client};
use std::env;
use dotenv::dotenv;

#[derive(Debug, Serialize, Deserialize)]
pub struct JwToken {
    pub username: String,
    pub exp: usize,
    pub is_admin: bool,
}
impl JwToken {
    pub fn get_key() -> String {
        return "secret".to_string();
    }
    pub fn from_token(token: String) -> Result<Self, String>{
        let key = DecodingKey::from_secret(
            JwToken::get_key().as_ref()
        );
        let token_result = decode::<JwToken>(
            &token, &key, &Validation::default());
        match token_result {
            Ok(data) => {
                Ok(data.claims)
            },
            Err(error) => {
                let message = format!("{}", error);
                return Err(message);
            }
        }
    }
}
#[derive(Eq, PartialEq, Hash,Clone)]
pub struct WS {
    pub sender: Sender,
}
#[derive(Deserialize, Serialize)]
pub struct Ath {
    token: String,
}
lazy_static! {
    pub static ref SENDERS: Mutex<HashMap<WS, ()>> = {
        let mut map = HashMap::new();
        Mutex::new(map)
    };
    pub static ref ADMIN: Mutex<HashMap<WS, ()>> = {
        let mut map = HashMap::new();
        Mutex::new(map)
    };
}

impl WS {
    pub fn init(link: &str) -> Res<()> {
        Ok(listen(link, |out| {
            let ws = WS {
                sender: out,
            };
            println!("Yo YO count");
            SENDERS.lock().unwrap().insert(ws.clone(),());
            ws
        })?)
    }
}
use crate::PAGEINFO;
use crate::websocket::connect;

impl ws::Handler for WS {

    fn on_open(&mut self, shake: Handshake) -> ws::Result<()> {
        println!("Opened something");
        Ok(())
    }
    fn on_message(&mut self, msg: Message) -> ws::Result<()> {
        let msg = msg.into_text().unwrap();
        println!("Message received {}", msg);
        let mut admin: bool = false;
        let parsed_json: Result<Value, serde_json::Error> = serde_json::from_str(&msg);
        match &parsed_json {
            Ok(js) => {
                println!("Check 1");
                match js.get("token") {
                    Some(token) =>{
                        println!("Check 2");
                        match token.as_str() {
                            Some(token) => {
                                println!("Check 3");
                                let token_result = JwToken::from_token(token.to_string());
                                match token_result {
                                    Ok(token) => {
                                        admin = token.is_admin;
                                        println!("Got here {admin}");
                                        println!("got here {}", token.is_admin);
                                    },
                                    Err(message) => {
                                        if message == "ExpiredSignature".to_owned() {
                                            self.sender.close_with_reason(CloseCode::Invalid, "Invalid Token").expect("Failed to close due to wrong token");
                                        }
                                        self.sender.close_with_reason(CloseCode::Invalid, "Token can't be decoded").expect("Failed to close due to invalid token");
                                    }
                                }
                            },
                            None => {
                                self.sender.close_with_reason(CloseCode::Invalid, "Invalid token string").expect("Close_with_reason failed");
                            }
                        }
                    },
                    None => {
                        self.sender.close_with_reason(CloseCode::Invalid, "Token not found").expect("Close_with_reason failed");
                    }
                }
            }
            Err(_) => { self.sender.close(CloseCode::Invalid).expect("Close failed");}
        };
        let parsed_json = parsed_json.unwrap();
        {
            let page_info_guard = PAGEINFO.lock().unwrap();

            // Create a copy of the content
            let pg: PageInfo = page_info_guard.clone();
            let json_data = serde_json::to_string(&pg).unwrap();
            if *parsed_json.get("id").unwrap() == json!(1) {
                println!("Sending through here only");
                self.sender.send(json_data).expect("Failed to send the message");
                return Ok(());
            }
        }
        if admin == true {

            let rt = Runtime::new().unwrap();
            rt.block_on(async{
                let mut resp: (i32, String) = (-1, String::new());
                match parsed_json.get("id") {
                    Some(t) => {
                        resp = process_json(parsed_json).await;
                    },

                    None => ()
                }
                if resp.0 >=6 {
                    let client: Client = connect().await;
                    let s3: Statement = client.prepare("INSERT into overs (year, match_id, over_number, bowler, striker, non_striker, figures, team) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)").await.expect("Wrong over adding query");
                    let mut cur_state = PAGEINFO.lock().unwrap();
                    let mut overs = OVERS.lock().unwrap();

                    let year: i32 = env::var("YEAR").unwrap().parse().unwrap();
                    let match_id: i32 = env::var("MATCH").unwrap().parse().unwrap();
                    client.execute(&s3, &[&year, &match_id, &overs.over_number, &overs.bowler, &overs.striker, &overs.non_striker, &overs.figures, &cur_state.cur_bat_team]).await.expect("Error while inserting overs");
                    overs.figures = "".to_string();
                }
                println!("resp.1 {}", &resp.1);
                let mut json_data = "".to_string();
                {
                    let mut page_info_guard = PAGEINFO.lock().unwrap();
                    println!("{} {} {}", page_info_guard.team1.runs, page_info_guard.team1.overs, page_info_guard.team1.wickets);

                    println!("Balls taken {}", page_info_guard.team1.overs);
                    if (page_info_guard.team1.overs == 300 || page_info_guard.team1.wickets>=10) && (page_info_guard.cur_bat_team == page_info_guard.team1.team) {
                        println!("Team 1 {} Team1 wickets {} team1 runs", &page_info_guard.team1.team, &page_info_guard.team1.wickets);
                        let client = connect().await;
                        let s: Statement = client.prepare("UPDATE scorecard set runs_scored=$1, six_bat=$2, four_bat=$3, balls_faced=$4, out=$5, got_out=$6, balls_bowled=$7, runs_conceded=$8, wickets=$9, nb=$10, lb=$11, wd=$12, team=$13 where year=$14 and match_id=$15 and player_id=$16").await.expect("Wrong scorecard putting query");
                        let s2: Statement = client.prepare("UPDATE fixtures set run1=$1, run2=$2, wicket1=$3, wicket2=$4, ball1=$5, ball2=$6 where year=$7 and match_id=$8").await.expect("Wrong runs adding query");
                        let s3: Statement = client.prepare("INSERT into overs (year, match_id, over_number, bowler, striker, non_striker, figures, team) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)").await.expect("Wrong over adding query");
                        println!("Stuck here No?");
                        println!("I guess here");
                        let mut overs =OVERS.lock().unwrap();
                        println!("Definitely here");

                        let year: i32 = env::var("YEAR").unwrap().parse().unwrap();
                        let match_id: i32 = env::var("MATCH").unwrap().parse().unwrap();
                        for i in &page_info_guard.player1 {
                            client.execute(&s, &[&i.runs_scored, &i.six_bat, &i.four_bat, &i.balls_faced, &i.out, &i.got_out, &i.balls_bowled, &i.runs_conceded, &i.wickets, &i.nb, &i.lb, &i.wd, &i.country ,&year, &match_id, &i.player_id]).await.expect("Error pushing the values to database");
                            println!("here got here");
                        }
                        for i in &page_info_guard.player2 {
                            client.execute(&s, &[&i.runs_scored, &i.six_bat, &i.four_bat, &i.balls_faced, &i.out, &i.got_out, &i.balls_bowled, &i.runs_conceded, &i.wickets, &i.nb, &i.lb, &i.wd, &i.country ,&year, &match_id, &i.player_id]).await.expect("Error pushing the values to database");
                        }
                        client.execute(&s2, &[&page_info_guard.team1.runs, &page_info_guard.team2.runs, &page_info_guard.team1.wickets, &page_info_guard.team2.wickets, &page_info_guard.team1.overs, &page_info_guard.team2.overs, &year, &match_id]).await.expect("Error pushing the scores into fixtures");
                        match client.execute(&s3, &[&year, &match_id, &overs.over_number, &overs.bowler, &overs.striker, &overs.non_striker, &overs.figures, &page_info_guard.cur_bat_team]).await {
                            Ok(_) => { println!("Overs added successfully");}
                            Err(_) => { println!("Error while adding overs");}
                        }
                        overs.figures = "".to_string();
                        overs.over_number +=1;
                        overs.num_ball=0;
                        overs.bowler=0;
                        page_info_guard.cur_bat_team = page_info_guard.team2.team.clone();
                        page_info_guard.striker = 0;
                        page_info_guard.non_striker=0;
                        page_info_guard.bowler=0;
                    }
                    else if (page_info_guard.cur_bat_team == page_info_guard.team2.team) && (page_info_guard.team2.overs == 300 || page_info_guard.team2.wickets>=10 || page_info_guard.team2.runs > page_info_guard.team1.runs) {
                        let client = connect().await;
                        let s: Statement = client.prepare("UPDATE scorecard set runs_scored=$1, six_bat=$2, four_bat=$3, balls_faced=$4, out=$5, got_out=$6, balls_bowled=$7, runs_conceded=$8, wickets=$9, nb=$10, lb=$11, wd=$12, team=$13 where year=$14 and match_id=$15 and player_id=$16").await.expect("Wrong scorecard putting query");
                        let s2: Statement = client.prepare("UPDATE fixtures set run1=$1, run2=$2, wicket1=$3, wicket2=$4, ball1=$5, ball2=$6 where year=$7 and match_id=$8").await.expect("Wrong runs adding query");
                        let s3: Statement = client.prepare("INSERT into overs (year, match_id, over_number, bowler, striker, non_striker, figures, team) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)").await.expect("Wrong over adding query");
                        let mut overs =OVERS.lock().unwrap();

                        let year: i32 = env::var("YEAR").unwrap().parse().unwrap();
                        let match_id: i32 = env::var("MATCH").unwrap().parse().unwrap();
                        match client.execute(&s3, &[&year, &match_id, &overs.over_number, &overs.bowler, &overs.striker, &overs.non_striker, &overs.figures, &page_info_guard.cur_bat_team]).await {
                            Ok(_) => {println!("Overs added successfully");}
                            Err(_) => {println!("Error while adding overs");}
                        }
                        overs.figures = "".to_string();
                        overs.over_number +=1;
                        overs.num_ball=0;
                        overs.bowler=0;
                        for i in &page_info_guard.player1 {
                            client.execute(&s, &[&i.runs_scored, &i.six_bat, &i.four_bat, &i.balls_faced, &i.out, &i.got_out, &i.balls_bowled, &i.runs_conceded, &i.wickets, &i.nb, &i.lb, &i.wd, &i.country ,&year, &match_id, &i.player_id]).await.expect("Error pushing the values to database");
                        }
                        for i in &page_info_guard.player2 {
                            client.execute(&s, &[&i.runs_scored, &i.six_bat, &i.four_bat, &i.balls_faced, &i.out, &i.got_out, &i.balls_bowled, &i.runs_conceded, &i.wickets, &i.nb, &i.lb, &i.wd, &i.country ,&year, &match_id, &i.player_id]).await.expect("Error pushing the values to database");
                        }
                        client.execute(&s2, &[&page_info_guard.team1.runs, &page_info_guard.team2.runs, &page_info_guard.team1.wickets, &page_info_guard.team2.wickets, &page_info_guard.team1.overs, &page_info_guard.team2.overs, &year, &match_id]).await.expect("Error pushing the scores into fixtures");
                        page_info_guard.cur_bat_team = page_info_guard.team2.team.clone();

                        let stww: Statement = client.prepare("UPDATE teams SET won=won+1 WHERE year=$1 AND team_playing =$2").await.expect("wrong winner adding query");
                        let stll: Statement = client.prepare("UPDATE teams SET lost =lost+1 WHERE year=$1 AND team_playing =$2").await.expect("wrong winner adding query");
                        let sttt: Statement = client.prepare("UPDATE teams SET draw =draw+1 WHERE year=$1 AND team_playing =$2").await.expect("wrong winner adding query");
                        let stfx: Statement = client.prepare("UPDATE fixtures SET winner=$1 WHERE year=$2 AND match_id=$3").await.expect("Wrong winner addin query");
                        let mut winner: String;
                        let mut loser: String;
                        let mut tied: bool =false;
                        if page_info_guard.team1.runs > page_info_guard.team2.runs {
                            winner = page_info_guard.team1.team.clone();
                            loser = page_info_guard.team2.team.clone();
                        } else if page_info_guard.team1.runs < page_info_guard.team2.runs {
                            loser = page_info_guard.team1.team.clone();
                            winner = page_info_guard.team2.team.clone();
                        } else {
                            tied=true;
                            winner = page_info_guard.team1.team.clone();
                            loser = page_info_guard.team2.team.clone();
                        }
                        if tied {
                            client.execute(&sttt, &[&year, &winner]).await.expect("Error Adding draw");
                            client.execute(&sttt, &[&year, &loser]).await.expect("Error Adding draw");
                            client.execute(&stfx, &[&winner, &year, &match_id]).await.expect("Error adding winner in fixtures");
                        } else {
                            client.execute(&stll, &[&year, &loser]).await.expect("Error Adding Loser");
                            client.execute(&stww, &[&year, &winner]).await.expect("Error Adding winner");
                            client.execute(&stfx, &[&winner, &year, &match_id]).await.expect("Error adding winner in fixtures");
                        }
                    }
                    let pg: PageInfo = page_info_guard.clone();
                    json_data = serde_json::to_string(&pg).unwrap();
                    for (client,_) in SENDERS.lock().unwrap().iter() {
                        client.sender.send(json_data.clone()).unwrap();
                    }
                }

            });
        }

        // let last = msg.last().unwrap();
        Ok(())
    }
    fn on_close(&mut self, code: CloseCode, reason: &str) {
        match SENDERS.lock().unwrap().remove(&self) {
            None => {}
            Some(_) => {}
        }
    }

    fn on_error(&mut self, err: Error) {}
}