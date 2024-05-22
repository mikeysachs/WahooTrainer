use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub fn start_erg_mode(ftp: f32) {
    // Log een bericht naar de console
    console::log_1(&format!("Starting ERG mode with FTP: {}", ftp).into());
}
