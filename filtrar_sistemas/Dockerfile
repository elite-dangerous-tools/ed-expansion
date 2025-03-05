# Usamos una imagen base de Rust oficial para compilar el proyecto
FROM rust:latest

# Establecemos el directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos el archivo Cargo.toml y Cargo.lock (si los tienes) al contenedor
COPY Cargo.toml ./
COPY filtrar_json.rs ./

RUN cargo build --release
