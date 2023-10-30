
use std::env;
use std::mem::swap;
use std::sync::MutexGuard;
use serde_json::{Value, json};
use tokio_postgres::{Statement, Client, Error};
use crate::{PAGEINFO, OVERS, Score, PageInfo, Player};
use crate::websocket::connect;
use serde_derive::Serialize;
#[derive(Serialize)]
struct Id2 {
    json_id: i32,
    striker: i32,
    non_striker: i32,
    team: String,
}
#[derive(Serialize)]
struct Id4 {
    json_id: i32,
    striker: i32,
    non_striker: i32,
    ball_number: i32,
    figure: i32,
}
#[derive(Serialize)]
struct Id3 {
    json_id: i32,
    striker: i32,
    non_striker: i32,
    bowler: i32,
    over_num: i32,
}
#[derive(Serialize)]
struct Id5 {
    json_id: i32,
    message: String,
}
pub async fn process_json( js: Value) -> (i32, String) {
    let client: Client = connect().await;
    println!("{:?}", &js.get("id"));
    if *js.get("id").unwrap() == json!(2) {
        println!("Actually got here in 2");
        let id: i32=2;
        let inn: String = js.get("team").unwrap().as_str().unwrap().to_string();
        println!("team {}", &inn);
        let mut striker: i32=0;
        let mut non_striker: i32=0;
        println!("Prepare");
        let mut pgi: MutexGuard<PageInfo> = PAGEINFO.lock().unwrap();
        println!("Prepared yet?");
        if inn == pgi.team1.team{
            for item in &mut pgi.player1 {
                println!("Inside");
                if item.player_seq == 1 {
                    println!("Got id 1 {}", &item.player_id);
                    striker = item.player_id;
                    item.out = true;
                } else if item.player_seq == 2 {
                    println!("Got id 1 {}", &item.player_id);
                    non_striker = item.player_id;
                    item.out = true;
                }
            }
        } else {
            for item in &mut pgi.player2 {
                println!("Inside");
                if item.player_seq == 1 {
                    println!("Got id 1 {}", &item.player_id);
                    striker = item.player_id;
                    item.out = true;
                } else if item.player_seq == 2 {
                    println!("Got id 1 {}", &item.player_id);
                    non_striker = item.player_id;
                    item.out = true;
                }
            }
        }
        println!("Out");
        pgi.striker = striker;
        pgi.non_striker = non_striker;
        pgi.cur_bat_team = inn.clone();
        let json_object = Id2 {
            json_id: id,
            striker,
            non_striker,
            team: inn,
        };
        println!("Almost at the end");
        // Convert the JSON object to a string
        let json_string = serde_json::to_string(&json_object).unwrap();
        println!("JSON String 2 {}", &json_string);
        return (0, json_string);
    }
    if *js.get("id").unwrap() == json!(3) {
        println!("Got in json 3");
        let bowler: i32 = js.get("bowler").unwrap().as_i64().unwrap() as i32;
        { PAGEINFO.lock().unwrap().bowler = bowler; }
        let mut pgi = PAGEINFO.lock().unwrap();
        let mut over_num: i32 = 0;
        if pgi.cur_bat_team == pgi.team1.team {
            over_num = pgi.team1.overs/6 + 1;
        } else {
            over_num = pgi.team2.overs/6 + 1;
        }

        let striker: i32 = js.get("striker").unwrap().as_i64().unwrap() as i32;
        let non_striker: i32 = js.get("non_striker").unwrap().as_i64().unwrap() as i32;
        let mut overs = OVERS.lock().unwrap();
        overs.over_number = over_num;
        if over_num != 1{
            overs.striker = non_striker;
            pgi.striker = non_striker;
            pgi.non_striker =  striker;
            overs.non_striker = striker;
        } else {
            overs.striker = striker;
            overs.non_striker = non_striker;
            pgi.striker = striker;
            pgi.non_striker =  non_striker;
        }
        overs.bowler = bowler;
        pgi.bowler = bowler;
        let json_object: Id3 = Id3 {
            json_id: 3,
            striker: overs.striker,
            non_striker: overs.non_striker,
            bowler,
            over_num,
        };
        let json_string = serde_json::to_string(&json_object).unwrap();
        println!("json string {}", &json_string);
        return (0, json_string);
    }
    if *js.get("id").unwrap() == json!(4) {
        println!("Here here");
        let mut pgi: MutexGuard<PageInfo> = PAGEINFO.lock().unwrap();
        println!("Here here");
        let bowler: i32 = js.get("bowler").unwrap().as_i64().unwrap() as i32;
        let mut striker: i32 = js.get("striker").unwrap().as_i64().unwrap() as i32;
        let mut non_striker: i32 = js.get("non_striker").unwrap().as_i64().unwrap() as i32;
        let mut over_num=0;
        if pgi.cur_bat_team == pgi.team1.team {
            over_num = pgi.team1.overs/6 + 1;
        } else {
            over_num = pgi.team2.overs/6 + 1;
        }
        let mut ball_num: i32 = js.get("ball_num").unwrap().as_i64().unwrap() as i32;
        let inning: i32 = js.get("inning").unwrap().as_i64().unwrap() as i32;
        let fig: i32 = js.get("fig").unwrap().as_i64().unwrap() as i32;

        let mut sc: & mut Score;
        let mut scbat: &mut Vec<Player>;
        let mut scbowl: &mut Vec<Player>;
        // if inning == 1 {
        //     sc = & mut pgi.team1;
        //     scbat = &mut pgi.player1;
        //     scbowl = &mut pgi.player2;
        // } else {
        //     sc = &mut pgi.team2;
        //     scbat = &mut pgi.player2;
        //     scbowl = &mut pgi.player1;
        // }
        if fig == 0 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}0?", *cur_fig);
            }
            ball_num+=1;
            { OVERS.lock().unwrap().num_ball = ball_num; }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.overs +=1;
                sc.runs+=0;
            }
            {
                if inning == 1 {
                    scbat = & mut pgi.player1;
                } else {
                    scbat = &mut pgi.player2;
                }
                let mut cur_p: &mut Player = &mut scbat.iter_mut().find(|x| x.player_id == striker).unwrap();
                cur_p.balls_faced += 1;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.balls_bowled += 1;
            }
            let json_object: Id4 = Id4 {
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 1 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}1?", *cur_fig);
            }
            ball_num+=1;
            { OVERS.lock().unwrap().num_ball = ball_num; }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.overs +=1;
                sc.runs+=1;
            }
            {
                if inning == 1 {
                    scbat = & mut pgi.player1;
                } else {
                    scbat = &mut pgi.player2;
                }
                let mut cur_p: &mut Player = &mut scbat.iter_mut().find(|x| x.player_id == striker).unwrap();
                cur_p.balls_faced += 1;
                cur_p.runs_scored+=1;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.balls_bowled += 1;
                cur_b.runs_conceded+=1;
            }
            swap(& mut striker, & mut non_striker);
            pgi.striker = striker;
            pgi.non_striker = non_striker;
            let json_object: Id4  = Id4{
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 2 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}2?", *cur_fig);
            }
            ball_num+=1;
            { OVERS.lock().unwrap().num_ball = ball_num; }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.overs +=1;
                sc.runs+=2;
            }
            {
                if inning == 1 {
                    scbat = & mut pgi.player1;
                } else {
                    scbat = &mut pgi.player2;
                }
                let mut cur_p: &mut Player = &mut scbat.iter_mut().find(|x| x.player_id == striker).unwrap();
                cur_p.balls_faced += 1;
                cur_p.runs_scored+=2;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.balls_bowled += 1;
                cur_b.runs_conceded+=2;
            }
            let json_object: Id4  = Id4{
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 3 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}3?", *cur_fig);
            }
            ball_num+=1;
            { OVERS.lock().unwrap().num_ball = ball_num; }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.overs +=1;
                sc.runs+=3;
            }
            {
                if inning == 1 {
                    scbat = & mut pgi.player1;
                } else {
                    scbat = &mut pgi.player2;
                }
                let mut cur_p: &mut Player = &mut scbat.iter_mut().find(|x| x.player_id == striker).unwrap();
                cur_p.balls_faced += 1;
                cur_p.runs_scored+=3;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.balls_bowled += 1;
                cur_b.runs_conceded+=3;
            }
            swap(& mut striker, & mut non_striker);
            pgi.striker = striker;
            pgi.non_striker = non_striker;
            let json_object: Id4  = Id4{
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 4 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}4?", *cur_fig);
            }
            ball_num+=1;
            { OVERS.lock().unwrap().num_ball = ball_num; }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.overs +=1;
                sc.runs+=4;
            }
            {
                if inning == 1 {
                    scbat = & mut pgi.player1;
                } else {
                    scbat = &mut pgi.player2;
                }
                let mut cur_p: &mut Player = &mut scbat.iter_mut().find(|x| x.player_id == striker).unwrap();
                cur_p.balls_faced += 1;
                cur_p.runs_scored+=4;
                cur_p.four_bat+=1;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.balls_bowled += 1;
                cur_b.runs_conceded+=4;
            }
            let json_object: Id4  = Id4{
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 6 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}6?", *cur_fig);
            }
            ball_num+=1;
            { OVERS.lock().unwrap().num_ball = ball_num; }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.overs +=1;
                sc.runs+=6;
            }
            {
                if inning == 1 {
                    scbat = & mut pgi.player1;
                } else {
                    scbat = &mut pgi.player2;
                }
                let mut cur_p: &mut Player = &mut scbat.iter_mut().find(|x| x.player_id == striker).unwrap();
                cur_p.balls_faced += 1;
                cur_p.runs_scored+=6;
                cur_p.six_bat+=1;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.balls_bowled += 1;
                cur_b.runs_conceded+=6;
            }
            let json_object: Id4  = Id4{
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 7 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}W?", *cur_fig);
            }
            ball_num+=1;
            { OVERS.lock().unwrap().num_ball = ball_num; }
            let mut next_id_striker: i32 =0;
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.overs +=1;
                sc.wickets+=1;
            }
            {
                if inning == 1 {
                    scbat = & mut pgi.player1;
                } else {
                    scbat = &mut pgi.player2;
                }
                match &mut scbat.iter_mut().find(|x| x.player_id == striker) {
                    None => {}
                    Some(s) => {
                        let mut cur_p: &mut Player = s;
                        cur_p.balls_faced += 1;
                        cur_p.got_out=true;
                    }
                }
            }
            let mut wickets: i32 = 0;
            {
                let mut sc: &Score;
                if inning == 1 {
                    sc = &  pgi.team1;
                } else {
                    sc = & pgi.team2;
                }
                wickets = sc.wickets+2;
            }
            {
                let mut scbat: &mut Vec<Player>;

                if inning == 1 {
                    scbat = &mut  pgi.player1;
                } else {
                    scbat = &mut  pgi.player2;
                }
                match scbat.iter_mut().find(|x| x.player_seq == wickets){
                    None => {}
                    Some(s) => {
                        let mut next_p = s;
                        next_id_striker = next_p.player_id;
                        next_p.out=true;
                        pgi.striker = next_id_striker.clone();
                    }
                }

            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.balls_bowled += 1;
                cur_b.wickets+=1;
            }
            let json_object: Id4  = Id4{
                json_id: 4,
                striker: next_id_striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 8 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}WD?", *cur_fig);
            }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.runs+=1;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.wd += 1;
                cur_b.runs_conceded+=1;
            }
            let json_object: Id4  = Id4{
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 9 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}LB?", *cur_fig);
            }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.runs+=1;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.lb += 1;
                cur_b.runs_conceded+=1;
            }
            let json_object: Id4  = Id4{
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
        if fig == 10 {
            {
                let mut cur_fig = &mut OVERS.lock().unwrap().figures;
                *cur_fig = format!("{}NB?", *cur_fig);
            }
            {
                if inning == 1 {
                    sc = & mut pgi.team1;
                } else {
                    sc = &mut pgi.team2;
                }
                sc.runs+=1;
            }
            {
                if inning == 1 {
                    scbowl = & mut pgi.player2;
                } else {
                    scbowl = &mut pgi.player1;
                }
                let mut cur_b: &mut Player = &mut scbowl.iter_mut().find(|x| x.player_id == bowler).unwrap();
                cur_b.nb += 1;
                cur_b.runs_conceded+=1;
            }
            let json_object: Id4  = Id4{
                json_id: 4,
                striker,
                non_striker,
                ball_number: ball_num,
                figure: fig,
            };
            let json_string = serde_json::to_string(&json_object).unwrap();
            return (ball_num, json_string);
        }
    }
    if *js.get("id").unwrap() == json!(5) || *js.get("id").unwrap() == json!(6) {
        let s: Statement = client.prepare("UPDATE scorecard set runs_scored=$1, six_bat=$2, four_bat=$3, balls_faced=$4, out=$5, got_out=$6, balls_bowled=$7, runs_conceded=$8, wickets=$9, nb=$10, lb=$11, wd=$12, team=$13 where year=$14 and match_id=$15 and player_id=$16").await.expect("Wrong scorecard putting query");
        let s2: Statement = client.prepare("UPDATE fixtures set run1=$1, run2=$2, wicket1=$3, wicket2=$4, ball1=$5, ball2=$6 where year=$7 and match_id=$8").await.expect("Wrong runs adding query");
        let s3: Statement = client.prepare("INSERT into overs (year, match_id, over_number, bowler, striker, non_striker, figures, team) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)").await.expect("Wrong over adding query");
        let mut cur_state = PAGEINFO.lock().unwrap();
        let mut overs =OVERS.lock().unwrap();

        let year: i32 = env::var("YEAR").unwrap().parse().unwrap();
        let match_id: i32 = env::var("MATCH").unwrap().parse().unwrap();
        match client.execute(&s3, &[&year, &match_id, &overs.over_number, &overs.bowler, &overs.striker, &overs.non_striker, &overs.figures, &cur_state.cur_bat_team]).await {
            Ok(_) => {}
            Err(_) => {}
        }
        overs.figures = "".to_string();
        for i in &cur_state.player1 {
            client.execute(&s, &[&i.runs_scored, &i.six_bat, &i.four_bat, &i.balls_faced, &i.out, &i.got_out, &i.balls_bowled, &i.runs_conceded, &i.wickets, &i.nb, &i.lb, &i.wd, &i.country ,&year, &match_id, &i.player_id]).await.expect("Error pushing the values to database");
        }
        for i in &cur_state.player2 {
            client.execute(&s, &[&i.runs_scored, &i.six_bat, &i.four_bat, &i.balls_faced, &i.out, &i.got_out, &i.balls_bowled, &i.runs_conceded, &i.wickets, &i.nb, &i.lb, &i.wd, &i.country ,&year, &match_id, &i.player_id]).await.expect("Error pushing the values to database");
        }
        client.execute(&s2, &[&cur_state.team1.runs, &cur_state.team2.runs, &cur_state.team1.wickets, &cur_state.team2.wickets, &cur_state.team1.overs, &cur_state.team2.overs, &year, &match_id]).await.expect("Error pushing the scores into fixtures");
        cur_state.cur_bat_team = cur_state.team2.team.clone();

        let json_object: Id5 = Id5 {
            json_id: js.get("id").unwrap().as_i64().unwrap().clone() as i32,
            message: "Ended Successfully".to_string(),
        };
        let json_string = serde_json::to_string(&json_object).unwrap();
        return (0, json_string);
    }
    (-1, String::new())
}

