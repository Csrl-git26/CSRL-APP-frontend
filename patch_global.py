import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "source.profiles, source.tests" in line:
        print(f"Line {i+1}: {line.strip()}")
