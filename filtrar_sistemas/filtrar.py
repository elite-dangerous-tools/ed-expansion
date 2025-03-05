import ijson
import orjson

MAXIMO = 500

def filtrar_json(archivo_entrada, archivo_salida):
    with open(archivo_entrada, 'rb') as f, open(archivo_salida, 'wb') as out:
        out.write(b'[\n')  # Inicia el JSON de salida
        primer_elemento = True
        filas_procesadas = 0

        for item in ijson.items(f, 'item'):
            x, y, z = map(float, item["coords"].values())
            if abs(x) <= MAXIMO and abs(y) <= MAXIMO and abs(z) <= MAXIMO:
                if not primer_elemento:
                    out.write(b',\n')
                out.write(orjson.dumps({"name": item["name"], "coords": {"x": x, "y": y, "z": z}}))
                primer_elemento = False
        
            filas_procesadas += 1
            if filas_procesadas % 100000 == 0:
                print(filas_procesadas, "filas procesadas")
        
        out.write(b'\n]')  # Cierra el JSON de salida

# Uso del script
filtrar_json("systemsWithCoordinates.json", "sistemas.json")
