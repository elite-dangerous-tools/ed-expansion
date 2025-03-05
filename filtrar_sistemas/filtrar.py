import json

input_file = 'systems2000.json'  # Nombre del archivo de entrada
with open(input_file, 'r', encoding='utf-8') as f:
    datos = json.load(f)

print("Hemos leido el fichero de carga")

def filtrar_sistemas(limite=100):
    output_file = 'sistemas{}.json'.format(limite)  # Nombre del archivo de salida

    # Filtrar sistemas que no superan limite en x, y o z
    filtrados = [sistema for sistema in datos if abs(sistema['c']['x']) <= limite and abs(sistema['c']['y']) <= limite and abs(sistema['c']['z']) <= limite]
    
    # Guardar el resultado en un nuevo archivo
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(filtrados, f)

    print("Terminado fichero de límite {}.".format(limite))


filtrar_sistemas(550)
