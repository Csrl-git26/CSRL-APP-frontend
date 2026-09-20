import os
import re

def patch_file(filepath, is_center):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace currentDoc?.weakTopics with currentDoc?.subjectWise
    content = content.replace("const weakTopics  = currentDoc?.weakTopics || {};", "const subjectWise  = currentDoc?.subjectWise || {};")

    # Replace mapping logic
    old_mapping = """          {SUBJECTS.map((subject) => {
            const subData = weakTopics[subject] || { strongWeak: [], mediumWeak: [] };
            return (
              <WeakTopicCard
                key={subject}
                subject={subject}
                strongWeak={subData.strongWeak || []}
                mediumWeak={subData.mediumWeak || []}
                isCenter={""" + ("true" if is_center else "false") + """}
              />
            );
          })}"""

    new_mapping = """          {SUBJECTS.map((subject) => {
            const subjectKey = subject.toUpperCase();
            const subData = subjectWise[subjectKey] || { strong: [], moderate: [], weak: [] };
            return (
              <WeakTopicCard
                key={subject}
                subject={subject}
                strongWeak={subData.weak || []}
                mediumWeak={subData.moderate || []}
                isCenter={""" + ("true" if is_center else "false") + """}
              />
            );
          })}"""

    content = content.replace(old_mapping, new_mapping)

    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Patched {filepath}")

patch_file('src/components/StudentWeakTopics.jsx', False)
patch_file('src/components/CenterWeakTopics.jsx', True)

