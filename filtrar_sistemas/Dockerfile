# Imagen base oficial de Rust
FROM rust:latest

# Crear el directorio de trabajo
WORKDIR /usr/src/app

# Copiar los archivos del proyecto
COPY Cargo.toml ./
COPY src ./src

# Compilar el proyecto en modo release
RUN cargo build --release

# Copiar el binario compilado a la carpeta de salida
RUN cp target/release/mi_proyecto /usr/src/ejecutable

