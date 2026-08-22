import sys

from sqlalchemy import create_engine

try:
    # Insere o diretório atual no PYTHONPATH para importação local funcionar caso executado na raiz do backend
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    from app.database import Base
    print("Sucesso ao importar Base e modelos SQLAlchemy.")
except Exception as e:
    print(f"Erro ao importar modelos: {e}")
    sys.exit(1)

def test_sqlite_creation():
    print("Tentando criar tabelas em uma base SQLite em memória para verificação estrutural...")
    try:
        # SQLite em memória ignora algumas regras específicas de dialeto do Postgres,
        # mas serve como um validador sintático perfeito de relacionamentos e declarações no SQLAlchemy.
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=engine)
        print("Sucesso! As tabelas do SQLAlchemy foram criadas e vinculadas corretamente no teste em memória.")
    except Exception as e:
        print(f"Falha na validação em memória do SQLAlchemy: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_sqlite_creation()
