from flask import Flask
from flask_cors import CORS

import backend.controller.controller as controller_module
from backend.controller.controller import students_bp

from backend.repositories import StudentRepository
from backend.services import StudentService


def create_app():
    app = Flask(__name__)

    CORS(app)

    repo = StudentRepository.get_instance()
    service = StudentService.get_instance(repo=repo)

    controller_module.service = service

    app.register_blueprint(students_bp)

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
