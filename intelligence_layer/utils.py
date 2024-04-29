import random


def generate_color_map(labels):
    color_map = {}
    for label in labels:
        color_map[label] = f'rgb({random.randint(0, 255)},{random.randint(0, 255)},{random.randint(0, 255)})'
    return color_map
