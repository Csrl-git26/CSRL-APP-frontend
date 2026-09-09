file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/index.css'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("--shadow: 0 2px 12px rgba(26, 79, 160, .10);", "--shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025);")
content = content.replace("--radius: 10px;", "--radius: 16px;")

old_card = """.card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}"""

new_card = """.card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid #f1f5f9;
  padding: 20px;
}"""
content = content.replace(old_card, new_card)

with open(file_path, 'w') as f:
    f.write(content)
