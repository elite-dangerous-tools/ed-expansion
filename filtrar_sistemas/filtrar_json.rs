use serde::{Deserialize, Serialize};
use serde_json::{self, Value};
use std::{fs::File, io::{self, BufReader, BufWriter, Write}};
use tokio::task;

const MAXIMO: f64 = 500.0;

// Definir las estructuras
#[derive(Deserialize, Serialize)]
struct Coord {
    x: f64,
    y: f64,
    z: f64,
}

#[derive(Deserialize, Serialize)]
struct Item {
    name: String,
    coords: Coord,
}

// Función para filtrar y procesar el archivo JSON
async fn filtrar_json(archivo_entrada: &str, archivo_salida: &str) -> io::Result<()> {
    // Abrir archivo de entrada
    let file = File::open(archivo_entrada)?;
    let reader = BufReader::new(file);

    // Abrir archivo de salida
    let out_file = File::create(archivo_salida)?;
    let mut writer = BufWriter::new(out_file);

    writer.write_all(b"[\n")?;

    let mut primer_elemento = true;
    let mut filas_procesadas = 0;

    // Procesar el JSON en partes (modo streaming)
    let mut stream = serde_json::Deserializer::from_reader(reader).into_iter::<Item>();

    while let Some(item) = stream.next() {
        match item {
            Ok(item) => {
                let x = item.coords.x;
                let y = item.coords.y;
                let z = item.coords.z;

                // Filtrar el item si las coordenadas están dentro del rango
                if x.abs() <= MAXIMO && y.abs() <= MAXIMO && z.abs() <= MAXIMO {
                    if !primer_elemento {
                        writer.write_all(b",\n")?;
                    }
                    
                    // Escribir el item al archivo de salida
                    let json_data = serde_json::to_vec(&item)?;
                    writer.write_all(&json_data)?;

                    primer_elemento = false;
                }
            }
            Err(e) => {
                eprintln!("Error procesando item: {}", e);
            }
        }

        filas_procesadas += 1;

        // Imprimir cada 100,000 filas procesadas
        if filas_procesadas % 100000 == 0 {
            println!("{} filas procesadas", filas_procesadas);
        }
    }

    // Escribir el cierre del JSON
    writer.write_all(b"\n]")?;

    Ok(())
}

#[tokio::main]
async fn main() {
    // Llamada a la función de filtrado
    match filtrar_json("systemsWithCoordinates.json", "sistemas.json").await {
        Ok(_) => println!("Filtrado completado."),
        Err(e) => eprintln!("Error: {}", e),
    }
}