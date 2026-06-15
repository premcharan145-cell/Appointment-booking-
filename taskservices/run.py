from pathlib import Path
import subprocess
import sys


def main() -> int:
    project_root = Path(__file__).resolve().parent
    command = ["node", str(project_root / "main.js")]
    completed = subprocess.run(command, check=False)
    return completed.returncode


if __name__ == "__main__":
    sys.exit(main())