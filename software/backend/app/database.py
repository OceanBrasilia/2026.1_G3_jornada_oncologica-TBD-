from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# Cria a engine de conexão do SQLAlchemy
engine = create_engine(settings.DATABASE_URL)

# Cria a fábrica de sessões locais
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para criação de modelos
Base = declarative_base()


# Dependência do FastAPI para gerenciar a conexão por requisição
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
