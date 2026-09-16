from flask import Flask

from backend.controller.controller import students_bp

app = Flask(__name__)


def create_app():
    app = Flask(__name__)

    app.register_blueprint(students_bp)

    return app


app = create_app()


if __name__ == '__main__':
    app.run()
