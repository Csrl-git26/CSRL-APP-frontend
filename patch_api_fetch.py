import re

# Patch dataService.js
data_service_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/services/dataService.js'
with open(data_service_path, 'r') as f:
    data_service_content = f.read()

new_api_methods = """
export function deleteAllStudentDataApi() {
  return apiFetch(`/api/students/clear-all`, { method: 'DELETE' });
}

export function deleteAllTestDataApi() {
  return apiFetch(`/api/admin/tests-all/clear`, { method: 'DELETE' });
}
"""

if 'deleteAllStudentDataApi' not in data_service_content:
    data_service_content = data_service_content.replace(
        "export function deleteTestApi(dummy, testKey) {",
        new_api_methods + "\nexport function deleteTestApi(dummy, testKey) {"
    )
    with open(data_service_path, 'w') as f:
        f.write(data_service_content)
    print("Patched dataService.js")

# Patch AdminDashboard.jsx
admin_dash_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/AdminDashboard.jsx'
with open(admin_dash_path, 'r') as f:
    admin_dash_content = f.read()

# Fix import
admin_dash_content = admin_dash_content.replace(
    "deleteTestApi,\n  uploadPastYearData,",
    "deleteTestApi,\n  deleteAllStudentDataApi,\n  deleteAllTestDataApi,\n  uploadPastYearData,"
)

# Fix clearAllData
old_clear_all = """    try {
      const res = await fetch(`${API_BASE_URL}/api/students/clear-all`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {"""

new_clear_all = """    try {
      const data = await deleteAllStudentDataApi();
      if (data.success) {"""

admin_dash_content = admin_dash_content.replace(old_clear_all, new_clear_all)

# Fix handleFormatAllTestData
old_format_all = """    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tests-all/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {"""

new_format_all = """    try {
      const data = await deleteAllTestDataApi();
      if (data.success) {"""

admin_dash_content = admin_dash_content.replace(old_format_all, new_format_all)

with open(admin_dash_path, 'w') as f:
    f.write(admin_dash_content)
print("Patched AdminDashboard.jsx")

