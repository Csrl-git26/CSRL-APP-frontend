with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Add import
if 'import SubjectTopCentres' not in content:
    content = content.replace("import { useMemo, useState } from 'react';", "import { useMemo, useState } from 'react';\nimport SubjectTopCentres from './SubjectTopCentres';")

# 2. Add component
old_end = """              </div>
            </div>
          );
      })()}
      
      </div> {/* End Main Dashboard Layout */}"""

new_end = """              </div>
            </div>
          );
      })()}
      
      {/* Subject Top 3 Centres */}
      <SubjectTopCentres data={data} selectedTestKeys={selectedTestKey && selectedTestKey !== 'Multiple Tests' ? [selectedTestKey] : []} />

      </div> {/* End Main Dashboard Layout */}"""

content = content.replace(old_end, new_end)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
