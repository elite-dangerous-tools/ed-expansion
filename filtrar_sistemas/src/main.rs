use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::fs::File;
use std::io::{BufReader, BufWriter, Write};

const MAXIMO: f64 = 2000.0;

#[derive(Deserialize)]
struct Sistema {
    name: String,
    coords: Coordenadas,

    // Ignorar otros campos que no usamos
    #[serde(default)]
    id: Option<u64>,
    #[serde(default)]
    id64: Option<u64>,
    #[serde(default)]
    date: Option<String>,
}

#[derive(Deserialize, Serialize)]
struct Coordenadas {
    x: f64,
    y: f64,
    z: f64,
}

fn main() -> std::io::Result<()> {
    // Abrir archivo de entrada
    let input_file = File::open("/app/systemsWithCoordinates.json")?;
    let reader = BufReader::new(input_file);
    
    // Abrir archivo de salida
    let output_file = File::create("/app/systems2000.json")?;
    let mut writer = BufWriter::new(output_file);
    
    writeln!(writer, "[")?;

    let mut primer_elemento = true;


    println!("Leemos el JSON.");
    let sistemas: Vec<Sistema> = serde_json::from_reader(reader)?;
    println!("JSON cargado.");


    for sistema in sistemas {
        let x = sistema.coords.x;
        let y = sistema.coords.y;
        let z = sistema.coords.z;

        if x.abs() <= MAXIMO && y.abs() <= MAXIMO && z.abs() <= MAXIMO {
            if !primer_elemento {
                writeln!(writer, ",")?;
            }
            
            let json_data = json!({
                "n": sistema.name,
                "c": { "x": x, "y": y, "z": z }
            });

            write!(writer, "{}", json_data)?;
            primer_elemento = false;
        }

    }

    writeln!(writer, "\n]")?;

    println!("Filtrado completado.");
    Ok(())
}