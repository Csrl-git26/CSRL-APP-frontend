import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/Login.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add loadingText state
old_state = "  const [loading,  setLoading]  = useState(false);"
new_state = """  const [loading,  setLoading]  = useState(false);
  const [loadingText, setLoadingText] = useState('Signing in...');"""
content = content.replace(old_state, new_state)

# Add timeout to handleSubmit
old_submit = """  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    isLoggingIn.current = true;

    try {"""
new_submit = """  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    setLoadingText('Signing in...');
    isLoggingIn.current = true;

    const timer = setTimeout(() => {
      setLoadingText('Waking server (takes up to 50s)...');
    }, 4000);

    try {"""
content = content.replace(old_submit, new_submit)

# Clear timeout in finally block
old_finally = """    } finally {
      setLoading(false);
    }"""
new_finally = """    } finally {
      clearTimeout(timer);
      setLoading(false);
      setLoadingText('Signing in...');
    }"""
content = content.replace(old_finally, new_finally)

# Use loadingText in the button
old_btn = "{loading ? 'Signing in…' : 'Sign In'}"
new_btn = "{loading ? loadingText : 'Sign In'}"
content = content.replace(old_btn, new_btn)

with open(file_path, 'w') as f:
    f.write(content)

