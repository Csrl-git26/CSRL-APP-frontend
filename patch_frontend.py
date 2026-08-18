import os

filepath = '../CSRL-APP-frontend/src/components/ClearRawMarksModal.jsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("import { apiFetch } from '../utils/apiFetch';", "import { clearRawMarksApi } from '../services/weakTopicApi';")

content = content.replace(
"""      const res = await apiFetch(`/api/admin/clear-raw-marks?testId=${encodeURIComponent(testId.trim())}`, {
        method: 'DELETE'
      });""",
"      const res = await clearRawMarksApi(testId.trim());"
)

with open(filepath, 'w') as f:
    f.write(content)

print("Successfully patched ClearRawMarksModal.jsx!")
