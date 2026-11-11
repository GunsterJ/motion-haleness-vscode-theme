# Python demo — reading a config file with sensible defaults
from dataclasses import dataclass
from pathlib import Path
import json

DEFAULT_TIMEOUT = 30.0


@dataclass
class Config:
    host: str = "localhost"
    port: int = 8080
    retries: int = 3


def load_config(path: Path) -> Config:
    if not path.exists():
        return Config()

    with path.open("r") as fh:
        data = json.load(fh)

    return Config(**{k: v for k, v in data.items() if k in Config.__dataclass_fields__})


def main() -> None:
    cfg = load_config(Path("app.json"))
    print(f"Connecting to {cfg.host}:{cfg.port} with {cfg.retries} retries")


if __name__ == "__main__":
    main()