# Agent Guidelines

## 1. Finding API Keys
The project relies on two main API keys: Motherduck and Supabase.
- Both of these keys are available in the environment variables.
- **Important:** Do not echo any secrets on the screen.
- **Important:** Do not write or save any secrets into markdown files or any other unencrypted text files.
- Access these keys programmatically across the codebase by reading from the environment (e.g., `os.environ.get('MOTHERDUCK_TOKEN')`).

## 2. Managing Packages and Environment
- **Virtual Environment (`venv`):** Check if a virtual environment already exists before starting work. If there is an existing `venv`, do not start or create another one. Please activate and use the existing one.
- **Pip and Dependencies:** When managing Python packages using `pip`, always check for all `requirements.txt` files present in the directories. Use `pip install -r requirements.txt` to ensure package versions are correctly maintained and consistent with the project's setup.
