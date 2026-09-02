from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Jornada Oncológica API"
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/jornada_db"

    # Permite carregar do arquivo .env caso ele esteja presente na pasta backend/ ou raiz
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), env_file_encoding="utf-8", extra="ignore")


settings = Settings()
