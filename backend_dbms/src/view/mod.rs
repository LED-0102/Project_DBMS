use actix_web::web;
use fixtures::fetch_fixtures;
use teams::fetch_teams;
pub mod fixtures;
mod points_table;
mod player;
mod stats;
mod teams;
mod archive;
mod venue;
mod match_data;

use player::fetch_player;
use points_table::fetch_pt;
use stats::fetch_stat;
use crate::view::archive::fetch_archive;
use venue::fetch_venue;
use crate::view::match_data::fetch_match;

pub fn view_config (cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(fetch_fixtures)
            .service(fetch_pt)
            .service(fetch_player)
            .service(fetch_stat)
            .service(fetch_teams)
            .service(fetch_archive)
            .service(fetch_venue)
            .service(fetch_match)
    );
}