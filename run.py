from app import app, db

# Cria o contexto da aplicação
with app.app_context():
    # Cria todas as tabelas no banco de dados
    db.create_all()

# Inicia a aplicação
if __name__ == '__main__':
    app.run(debug=True)