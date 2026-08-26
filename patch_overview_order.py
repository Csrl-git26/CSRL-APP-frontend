import re

filepath = '../CSRL-APP-frontend/src/components/CentreDashboard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target = r"""        <CenterOverallWeakTopics centerId=\{selectedCenterCode\} />

        <div style=\{\{ marginTop: '24px' \}\}>
          <PerformanceChart chartData=\{centreChartData\} streamCfg=\{getStreamConfig\(activeCenter\?\.stream \|\| 'JEE'\)\} />
          <TestRecordsTable chartData=\{centreChartData\} streamCfg=\{getStreamConfig\(activeCenter\?\.stream \|\| 'JEE'\)\} stream=\{activeCenter\?\.stream \|\| 'JEE'\} isCentre=\{true\} />
        </div>"""

replacement = """        <div style={{ marginTop: '24px' }}>
          <PerformanceChart chartData={centreChartData} streamCfg={getStreamConfig(activeCenter?.stream || 'JEE')} />
          <TestRecordsTable chartData={centreChartData} streamCfg={getStreamConfig(activeCenter?.stream || 'JEE')} stream={activeCenter?.stream || 'JEE'} isCentre={true} />
        </div>

        <CenterOverallWeakTopics centerId={selectedCenterCode} />"""

content = re.sub(target, replacement, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched CentreDashboard.jsx order')
