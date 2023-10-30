use actix_web::web;
use fixtures::fetch_fixtures;

pub mod fixtures;

pub fn view_config (cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/fixtures", web::get().to(fetch_fixtures))
    );
}