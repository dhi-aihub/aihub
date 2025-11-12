#!/usr/bin/env bash
set -euo pipefail

venv_dir="$1"
requirements_file="$2"

# prefer python3 on PATH; fall back to python
python_cmd="$(command -v python3 || command -v python || true)"
if [ -z "$python_cmd" ]; then
  echo "Error: no python executable found" >&2
  exit 1
fi

"$python_cmd" -m venv "$venv_dir"

if [ -f "$venv_dir/bin/activate" ]; then
  # shellcheck source=/dev/null
  . "$venv_dir/bin/activate"
else
  echo "Warning: activate script not found at $venv_dir/bin/activate" >&2
fi

pip install --upgrade pip setuptools wheel

if [ -f "$requirements_file" ]; then
  pip install -r "$requirements_file"
else
  echo "Warning: requirements file not found: $requirements_file" >&2
fi

# only try to deactivate if the function exists
if command -v deactivate >/dev/null 2>&1; then
  deactivate || true
fi