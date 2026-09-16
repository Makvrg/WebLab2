from flask import Blueprint, jsonify, request

students_bp = Blueprint("students",
                        __name__,
                        url_prefix="/students"
                        )

service = None  # TODO StudentService

@students_bp.get("")
def get_students():
    try:
        filters = {
            "isuId": request.args.get("isuId"),
            "fio": request.args.get("fio"),
            "stGroup": request.args.get("stGroup"),
            "dormitoryNumber": request.args.get("dormitoryNumber"),
            "room": request.args.get("room"),
            "dateOfPlacement": request.args.get("dateOfPlacement"),
            "isNotRussian": request.args.get("isNotRussian")
        }

        students = service.get_students(filters)
        return jsonify(students), 200
    except Exception:  # TODO ServerException
        return jsonify({
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "The server cannot process the error"
            }
        }), 500

@students_bp.get("/<int:student_id>")
def get_student(student_id):
    try:
        student = service.get_student(student_id)
        return jsonify(student), 200
    except Exception:  # TODO NotFoundException
        return jsonify({
            "error": {
                "code": "NOT_FOUND",
                "message": f"Student by ISU_ID={student_id} not found"
            }
        }), 404
    except Exception:  # TODO ServerException
        return jsonify({
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "The server cannot process the error"
            }
        }), 500

@students_bp.post("")
def create_student():
    if not request.is_json:
        return jsonify({
            "error": {
                "code": "BAD_REQUEST",
                "message": "Request body must be JSON"
            }
        }), 400

    data = request.get_json()

    try:
        student = service.create_student(data)
        return jsonify(student), 201
    except ValueError as error:  # TODO ValidationException
        return jsonify({
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(error)
            }
        }), 422
    except FileExistsError:  # TODO NotUniqueIdException
        return jsonify({
            "error": {
                "code": "CONFLICT",
                "message": "Student with this ISU_ID already exists"
            }
        }), 409
    except Exception:  # TODO ServerException
        return jsonify({
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "The server cannot process the error"
            }
        }), 500

@students_bp.patch("/<int:student_id>")
def update_student(student_id):
    if not request.is_json:
        return jsonify({
            "error": {
                "code": "BAD_REQUEST",
                "message": "Request body must be JSON"
            }
        }), 400

    data = request.get_json()

    try:
        student = service.update_student(student_id, data)
        return jsonify(student), 200
    except ValueError as error:  # TODO ValidationError
        return jsonify({
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(error)
            }
        }), 422
    except FileExistsError:  # TODO NotFoundException
        return jsonify({
            "error": {
                "code": "NOT_FOUND",
                "message": f"Student by ISU_ID={student_id} not found"
            }
        }), 404
    except Exception:  # TODO ServerException
        return jsonify({
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "The server cannot process the error"
            }
        }), 500

@students_bp.delete("/<int:student_id>")
def delete_student(student_id):
    try:
        service.delete_student(student_id)
        return "", 204
    except ValueError as error:  # TODO ValidationError
        return jsonify({
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(error)
            }
        }), 422
    except FileExistsError:  # TODO NotFoundException
        return jsonify({
            "error": {
                "code": "NOT_FOUND",
                "message": f"Student by ISU_ID={student_id} not found"
            }
        }), 404
    except Exception:  # TODO ServerException
        return jsonify({
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "The server cannot process the error"
            }
        }), 500
